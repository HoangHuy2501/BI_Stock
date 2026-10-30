import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import type { StockSourceStatusResponse } from '@shared/api.interface';

interface ProxyBannerProps {
  status: StockSourceStatusResponse;
}

interface EnvHint {
  name: string;
  purpose: string;
}

const buildEnvHints = (status: StockSourceStatusResponse): EnvHint[] => [
  { name: status.envVars.baseUrl, purpose: 'upstream base URL' },
  { name: status.envVars.token, purpose: 'bearer token used by the proxy' },
  { name: status.envVars.cacheTtl, purpose: 'dataset cache TTL in seconds (default 300)' },
  { name: status.envVars.timeout, purpose: 'upstream request timeout in milliseconds (default 8000)' },
];

const ConfiguredBanner = ({ status }: ProxyBannerProps) => (
  <section
    role="status"
    className="rounded-xl border border-[#22a06b]/30 bg-[#e9f7ef] px-5 py-4"
  >
    <div className="flex items-center gap-2">
      <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-[#22a06b]" />
      <p className="text-[13px] font-semibold text-[#1c8055]">
        Proxy connected to the upstream source
      </p>
    </div>
    <p className="mt-1 text-[12px] leading-relaxed text-[#3f6b58]">
      The server holds the credentials and calls the upstream system on your behalf. The browser
      only reads the proxy state below.
    </p>
    <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#2f5b49]">
      <div className="flex min-w-0 items-baseline gap-2">
        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#5d8a76]">
          Base URL
        </dt>
        <dd className="break-all font-mono text-[11.5px]">{status.baseUrl ?? '—'}</dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#5d8a76]">
          Token
        </dt>
        <dd className="font-mono text-[11.5px] tabular-nums">{status.tokenMasked ?? '—'}</dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#5d8a76]">
          Cache TTL
        </dt>
        <dd className="tabular-nums">{status.cacheTtlSeconds} s</dd>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-[#5d8a76]">
          Timeout
        </dt>
        <dd className="tabular-nums">{status.timeoutMs} ms</dd>
      </div>
    </dl>
  </section>
);

const SnapshotBanner = ({ status }: ProxyBannerProps) => (
  <section
    role="status"
    className="rounded-xl border border-[#f0a020]/40 bg-[#fff5e2] px-5 py-4"
  >
    <div className="flex items-center gap-2">
      <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-[#f0a020]" />
      <p className="text-[13px] font-semibold text-[#a86c00]">
        Upstream source not configured — datasets come from the local snapshot
      </p>
    </div>
    <p className="mt-1 text-[12px] leading-relaxed text-[#8a5a00]">
      No upstream Base URL or token is set on the server, so every dataset is rebuilt from the
      snapshot stored in the application database. Nothing is being fetched from the upstream
      system until these environment variables are set:
    </p>
    <ul className="mt-2 grid gap-1.5 text-[12px] text-[#8a5a00]">
      {buildEnvHints(status).map((hint: EnvHint) => (
        <li key={hint.name} className="flex flex-wrap items-baseline gap-2">
          <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11.5px]">
            {hint.name}
          </code>
          <span>{hint.purpose}</span>
        </li>
      ))}
    </ul>
  </section>
);

export const ProxyBanner = ({ status }: ProxyBannerProps) =>
  status.configured ? <ConfiguredBanner status={status} /> : <SnapshotBanner status={status} />;
