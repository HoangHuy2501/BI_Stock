import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  suffix?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const SectionCard = ({ title, suffix, actions, className, children }: SectionCardProps) => (
  <Card
    className={cn(
      'rounded-xl border-[#eaecf0] bg-white shadow-[0_1px_2px_rgba(16_24_40_0.04)]',
      className,
    )}
  >
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-3 pt-4">
      <h3 className="text-[14px] font-bold leading-tight text-[#101828]">
        {title}
        {suffix ? <span className="ml-2 text-[13px] font-normal text-[#667085]">{suffix}</span> : null}
      </h3>
      {actions}
    </div>
    <div className="px-5 pb-[18px]">{children}</div>
  </Card>
);
