import type { ReactNode } from 'react';

interface CardProps {
  zh: string;
  en: string;
  note?: string;
  sub?: string;
  className?: string;
  headRight?: ReactNode;
  children: ReactNode;
}

const Card = ({ zh, en, note, sub, className, headRight, children }: CardProps) => (
  <section className={className ? `card ${className}` : 'card'}>
    <div className="card-head">
      <h2>
        {zh} <span>{en}</span>
      </h2>
      <div className="card-head-right">
        {note ? <span className="card-note">{note}</span> : null}
        {headRight}
      </div>
    </div>
    {sub ? <p className="card-sub">{sub}</p> : null}
    {children}
  </section>
);

export default Card;
