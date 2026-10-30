import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { StockSourceCall } from '@shared/api.interface';

import { SectionCard } from './SectionCard';
import {
  CALL_OUTCOME_TONES,
  formatDuration,
  formatTimestamp,
  type Tone,
} from './lib';

interface CallTableProps {
  calls: StockSourceCall[];
}

const HEAD_CLASS =
  'h-8 px-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#98a2b3]';

export const CallTable = ({ calls }: CallTableProps) => (
  <SectionCard title="Recent upstream calls" suffix="source_fetch_log">
    {calls.length === 0 ? (
      <p className="rounded-lg border border-dashed border-[#eaecf0] bg-[#fafbfc] px-4 py-6 text-center text-[12px] leading-relaxed text-[#667085]">
        No upstream calls recorded yet. Once the proxy reaches the source system, every request is
        logged here with its outcome, latency and error message.
      </p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow className="border-[#eaecf0]">
            <TableHead className={`${HEAD_CLASS} w-[150px]`}>Time</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[240px]`}>Endpoint</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[80px]`}>Method</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[95px]`}>Outcome</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[70px]`}>HTTP</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[90px]`}>Duration</TableHead>
            <TableHead className={HEAD_CLASS}>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call: StockSourceCall) => {
            const tone: Tone = CALL_OUTCOME_TONES[call.outcome];
            return (
              <TableRow key={call.id} className="border-[#eaecf0] text-[12px]">
                <TableCell className="px-2 py-2.5 tabular-nums text-[#344054]">
                  {formatTimestamp(call.calledAt)}
                </TableCell>
                <TableCell className="px-2 py-2.5 font-mono text-[11.5px] text-[#344054]">
                  {call.endpoint}
                </TableCell>
                <TableCell className="px-2 py-2.5 font-mono text-[10.5px] text-[#667085]">
                  {call.method}
                </TableCell>
                <TableCell className="px-2 py-2.5">
                  <Badge className={tone.className}>{tone.label}</Badge>
                </TableCell>
                <TableCell className="px-2 py-2.5 tabular-nums text-[#344054]">
                  {call.httpStatus === null ? '—' : call.httpStatus}
                </TableCell>
                <TableCell className="px-2 py-2.5 tabular-nums text-[#344054]">
                  {formatDuration(call.durationMs)}
                </TableCell>
                <TableCell className="whitespace-normal px-2 py-2.5 leading-relaxed text-[#667085]">
                  {call.message}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </SectionCard>
);
