import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { StockSourceEndpoint } from '@shared/api.interface';

import { SectionCard } from './SectionCard';
import {
  ACCESS_LABELS,
  METHOD_CLASSES,
  buildEndpointRows,
  type EndpointRow,
} from './lib';

interface EndpointTableProps {
  endpoints: StockSourceEndpoint[];
}

const HEAD_CLASS =
  'h-8 px-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#98a2b3]';

export const EndpointTable = ({ endpoints }: EndpointTableProps) => (
  <SectionCard title="Endpoints" suffix="proxy surface">
    <Table>
      <TableHeader>
        <TableRow className="border-[#eaecf0]">
          <TableHead className={`${HEAD_CLASS} w-[210px]`}>Name</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[90px]`}>Method</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[260px]`}>Path</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[80px]`}>Access</TableHead>
          <TableHead className={HEAD_CLASS}>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buildEndpointRows(endpoints).map((row: EndpointRow) => (
          <TableRow key={`${row.method} ${row.path}`} className="border-[#eaecf0] text-[12px]">
            <TableCell className="whitespace-normal px-2 py-2.5 font-medium text-[#101828]">
              {row.name}
            </TableCell>
            <TableCell className="px-2 py-2.5">
              <code
                className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold ${METHOD_CLASSES[row.access]}`}
              >
                {row.method}
              </code>
            </TableCell>
            <TableCell className="px-2 py-2.5 font-mono text-[11.5px] text-[#344054]">
              {row.path}
            </TableCell>
            <TableCell className="px-2 py-2.5">
              <Badge
                className={
                  row.access === 'write'
                    ? 'border-transparent bg-[#fff5e2] text-[#a86c00]'
                    : 'border-transparent bg-[#f2f4f7] text-[#475467]'
                }
              >
                {ACCESS_LABELS[row.access]}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-normal px-2 py-2.5 leading-relaxed text-[#667085]">
              {row.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    <p className="mt-3 text-[11.5px] leading-relaxed text-[#667085]">
      Every call goes through the typed <code className="font-mono text-[11px]">stockApi</code>{' '}
      helper in <code className="font-mono text-[11px]">client/src/api/stock.ts</code>; response
      shapes are declared in <code className="font-mono text-[11px]">shared/api.interface.ts</code>.
      Failures are normalised to <code className="font-mono text-[11px]">{'{ error: { code, message } }'}</code>{' '}
      and surfaced with <code className="font-mono text-[11px]">getStockErrorMessage</code>, so no
      page reads an axios message directly.
    </p>
  </SectionCard>
);
