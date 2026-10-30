import './reserve-states.css';

type SkeletonVariant = 'tiles' | 'bars' | 'list' | 'rows';

const CELL_CLASS: Record<SkeletonVariant, string> = {
  tiles: 'tile',
  bars: 'bar',
  list: 'line',
  rows: 'row',
};

const DEFAULT_COUNT: Record<SkeletonVariant, number> = {
  tiles: 5,
  bars: 7,
  list: 5,
  rows: 8,
};

interface ReserveSkeletonProps {
  variant: SkeletonVariant;
  count?: number;
}

const ReserveSkeleton = ({ variant, count }: ReserveSkeletonProps) => {
  const total = count ?? DEFAULT_COUNT[variant];
  const cells = Array.from({ length: total }, (_, index: number) => index);

  return (
    <div className="reserve-skel" aria-hidden="true">
      <div className={`reserve-skel-row ${variant}`}>
        {cells.map((index: number) => (
          <div key={index} className={`reserve-skel-cell ${CELL_CLASS[variant]}`} />
        ))}
      </div>
    </div>
  );
};

export default ReserveSkeleton;
