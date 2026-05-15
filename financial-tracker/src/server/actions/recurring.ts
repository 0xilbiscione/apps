"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { db } from "@/server/db";
import { requireMembership } from "@/server/workspace";
import { getFxRate } from "@/server/fx/provider";

export type RecurringState = { error?: string; success?: boolean };

export async function postDueRules(
  slug: string,
  _prev: RecurringState | undefined,
  _formData: FormData,
): Promise<RecurringState> {
  const { workspace } = await requireMembership(slug);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueRules = await db.recurringRule.findMany({
    where: {
      workspaceId: workspace.id,
      nextRunDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    include: {
      finAccount: true,
    },
  });

  if (dueRules.length === 0) {
    return { success: true };
  }

  try {
    for (const rule of dueRules) {
      await db.$transaction(async (tx) => {
        let currentDate = new Date(rule.nextRunDate);
        const daysToAdd = getIntervalDays(rule.freq, rule.interval);

        while (currentDate <= today && (!rule.endDate || currentDate <= rule.endDate)) {
          const fxRate = await getFxRate(
            rule.currency,
            workspace.baseCurrency,
            currentDate,
          );

          const amount = new Decimal(rule.amount);
          const baseAmount = amount.times(fxRate);

          await tx.transaction.create({
            data: {
              workspaceId: workspace.id,
              finAccountId: rule.finAccountId,
              counterAccountId: rule.counterAccountId || null,
              categoryId: rule.categoryId || null,
              date: currentDate,
              amount,
              currency: rule.currency,
              fxRate,
              baseAmount,
              type: rule.type,
              memo: rule.memo || null,
            },
          });

          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + daysToAdd);
        }

        await tx.recurringRule.update({
          where: { id: rule.id },
          data: { nextRunDate: currentDate, lastPostedAt: today },
        });
      });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to post recurring rules.",
    };
  }

  revalidatePath(`/app/${slug}/recurring`);
  revalidatePath(`/app/${slug}/transactions`);
  revalidatePath(`/app/${slug}/dashboard`);
  return { success: true };
}

function getIntervalDays(freq: string, interval: number): number {
  switch (freq) {
    case "DAILY":
      return interval;
    case "WEEKLY":
      return interval * 7;
    case "MONTHLY":
      return interval * 30;
    case "YEARLY":
      return interval * 365;
    default:
      return interval;
  }
}
