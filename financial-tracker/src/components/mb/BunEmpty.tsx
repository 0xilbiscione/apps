import { Eyebrow } from "./Eyebrow";

export function BunEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-card p-12 flex flex-col items-center text-center gap-4">
      <img
        src="https://metricbase.org/assets/pfp.png"
        alt="Bun"
        width={72}
        height={72}
        className="object-contain"
      />
      <Eyebrow>Bun says</Eyebrow>
      <h3 className="font-sans text-xl font-bold text-white max-w-md">
        {title}
      </h3>
      {description && (
        <p className="text-gray-2 text-sm max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
