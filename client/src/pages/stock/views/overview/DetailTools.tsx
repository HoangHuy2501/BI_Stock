import Icon from '../../components/Icon';
import { num } from '../../lib/format';

interface DetailToolsProps {
  search: string;
  onSearch: (value: string) => void;
  shown: number | null;
  total: number | null;
}

const DetailTools = ({ search, onSearch, shown, total }: DetailToolsProps) => (
  <>
    <div className="search">
      <Icon name="search" size={13} />
      <input
        type="search"
        value={search}
        placeholder="Search item, code, lot or buyer"
        onChange={(event) => onSearch(event.target.value)}
        aria-label="Search stock lines"
      />
    </div>
    <span className="count">
      {num(shown)} of {num(total)} lines
    </span>
  </>
);

export default DetailTools;
