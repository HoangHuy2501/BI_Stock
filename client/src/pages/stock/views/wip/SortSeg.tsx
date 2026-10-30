import type { WipSort } from './types';

const OPTIONS: { key: WipSort; label: string }[] = [
  { key: 'days', label: 'Oldest first' },
  { key: 'value', label: 'Value first' },
];

interface SortSegProps {
  sort: WipSort;
  onChange: (value: WipSort) => void;
}

const SortSeg = ({ sort, onChange }: SortSegProps) => (
  <div className="seg seg-sm">
    {OPTIONS.map((option: { key: WipSort; label: string }) => (
      <button
        key={option.key}
        type="button"
        className={sort === option.key ? 'on' : undefined}
        aria-pressed={sort === option.key}
        onClick={() => onChange(option.key)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default SortSeg;
