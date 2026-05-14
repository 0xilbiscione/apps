# apps

Hosted and in-development **MetricBase** web apps live here. Each subdirectory is its own deployable project with its own `README.md`, dependencies, and env files.

## Projects

| Directory | Description | Production |
| --- | --- | --- |
| [`financial-tracker`](./financial-tracker/) | Multi-tenant P&L / balance sheet / budgets / exports (Next.js, Prisma, Auth.js). | [`apps.metricbase.org`](https://apps.metricbase.org) |

Add new apps as sibling folders under `apps/` and link them in the table above.

## Workspace note

The static site and blogs remain in [`MetricBase/`](../MetricBase/) at the repo root; this `apps/` tree is for **dynamic** or **authenticated** products only.
