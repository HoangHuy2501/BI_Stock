import type { StockSourceStatusResponse } from '@shared/api.interface';

import { SectionCard } from './SectionCard';
import { formatNumber } from './lib';

interface ConfigCardProps {
  status: StockSourceStatusResponse;
}

interface ConfigRow {
  label: string;
  value: string;
  env: string;
  mono: boolean;
}

const buildRows = (status: StockSourceStatusResponse): ConfigRow[] => [
  { label: 'Base URL', value: status.baseUrl ?? '—', env: status.envVars.baseUrl, mono: true },
  { label: 'Bearer token', value: status.tokenMasked ?? '—', env: status.envVars.token, mono: true },
  {
    label: 'Cache TTL',
    value: `${formatNumber(status.cacheTtlSeconds)} s`,
    env: status.envVars.cacheTtl,
    mono: false,
  },
  {
    label: 'Request timeout',
    value: `${formatNumber(status.timeoutMs)} ms`,
    env: status.envVars.timeout,
    mono: false,
  },
];

export const ConfigCard = ({ status }: ConfigCardProps) => (
  <SectionCard title="Proxy configuration" suffix="server environment">
    <dl className="grid gap-3 sm:grid-cols-2">
      {buildRows(status).map((row: ConfigRow) => (
        <div key={row.label} className="rounded-lg border border-[#eaecf0] bg-[#fafbfc] px-3 py-2.5">
          <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#98a2b3]">
            {row.label}
          </dt>
          <dd
            className={
              row.mono
                ? 'mt-1 break-all font-mono text-[12px] tabular-nums text-[#101828]'
                : 'mt-1 text-[12px] font-semibold tabular-nums text-[#101828]'
            }
          >
            {row.value}
          </dd>
          <dd className="mt-1">
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-[#667085]">
              {row.env}
            </code>
          </dd>
        </div>
      ))}
    </dl>
  </SectionCard>
);
