import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Section({ title, children, className = '', fullWidth = false }: SectionProps) {
  return (
    <section className={`py-8 ${className}`}>
      {!fullWidth ? (
        <div className="max-w-[900px] mx-auto px-6">
          {title && <h2 className="text-[1.75rem] font-semibold border-b border-stone-200 pb-2 mb-6">{title}</h2>}
          {children}
        </div>
      ) : (
        <>
          {title && (
            <div className="max-w-[900px] mx-auto px-6">
              <h2 className="text-[1.75rem] font-semibold border-b border-stone-200 pb-2 mb-6">{title}</h2>
            </div>
          )}
          {children}
        </>
      )}
    </section>
  );
}

