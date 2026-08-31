import type { ReactNode } from 'react';

interface RowProps {
  label: string;
  children: ReactNode;
}

export function MobileRow({ label, children }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right min-w-0">{children}</span>
    </div>
  );
}

interface BadgeRowProps {
  label: string;
  children: ReactNode;
}

export function MobileBadgeRow({ label, children }: BadgeRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}

interface MobileCardProps {
  children: ReactNode;
  actionChildren?: ReactNode;
  inactive?: boolean;
  onClick?: () => void;
}

export function MobileCard({ children, actionChildren, inactive, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${
        inactive ? 'opacity-60 bg-gray-50' : ''
      } ${onClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
    >
      <div className="px-4 py-3">{children}</div>
      {actionChildren && (
        <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50/70 border-t border-gray-100">
          {actionChildren}
        </div>
      )}
    </div>
  );
}

interface MobileCardListProps {
  title?: ReactNode;
  emptyText?: string;
  children: ReactNode;
}

export function MobileCardList({ title, emptyText, children }: MobileCardListProps) {
  return (
    <div className="sm:hidden space-y-3">
      {title && <div className="px-1 pt-1 text-sm font-semibold text-gray-700">{title}</div>}
      {children}
      {emptyText && emptyText.length > 0 && children === null ? (
        <div className="text-center text-gray-500 py-8">{emptyText}</div>
      ) : null}
    </div>
  );
}
