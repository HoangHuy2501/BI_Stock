import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ConsoleErrorProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const ConsoleError = ({ message, retrying, onRetry }: ConsoleErrorProps) => (
  <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4 px-[26px] pb-2 pt-4">
    <section
      role="alert"
      className="rounded-xl border border-[#e35b53]/30 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16_24_40_0.04)]"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-[#e35b53]" />
        <h2 className="text-[14px] font-bold text-[#101828]">Unable to read the proxy status</h2>
      </div>
      <p className="mt-1.5 break-words text-[12px] leading-relaxed text-[#667085]">{message}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        onClick={onRetry}
        disabled={retrying}
        aria-label="Retry loading the proxy status"
      >
        {retrying ? <Spinner /> : null}
        {retrying ? 'Retrying…' : 'Retry'}
      </Button>
    </section>
  </div>
);
