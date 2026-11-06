import React from 'react';

interface SummaryMetricCardProps {
  label: string;
  value: string;
  detail: string;
  testId?: string;
}

export const SummaryMetricCard: React.FC<SummaryMetricCardProps> = ({
  label,
  value,
  detail,
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-2"
    >
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <p className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-slate-500 truncate">{detail}</p>
    </div>
  );
};
