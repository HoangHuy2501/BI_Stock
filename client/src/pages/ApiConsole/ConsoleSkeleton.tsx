import { Skeleton } from '@/components/ui/skeleton';

export const ConsoleSkeleton = () => (
  <div
    aria-busy="true"
    aria-live="polite"
    className="mx-auto flex w-full max-w-[1560px] flex-col gap-4 px-[26px] pb-2 pt-4"
  >
    <p className="sr-only">Loading the proxy status…</p>
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-36 w-full rounded-xl" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
);
