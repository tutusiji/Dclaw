import type { PropsWithChildren } from 'react';

interface PanelProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function Panel({ eyebrow, title, subtitle, className, children }: PanelProps) {
  return (
    <section className={['panel', className].filter(Boolean).join(' ')}>
      <header className="panel__header">
        {eyebrow ? <span className="panel__eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
