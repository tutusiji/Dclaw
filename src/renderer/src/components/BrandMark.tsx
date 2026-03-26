interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
}

const SIZE_CLASSNAME: Record<NonNullable<BrandMarkProps['size']>, string> = {
  sm: 'h-11 w-11 rounded-[18px]',
  md: 'h-12 w-12 rounded-[20px]',
  lg: 'h-[88px] w-[88px] rounded-full'
};

const ICON_CLASSNAME: Record<NonNullable<BrandMarkProps['size']>, string> = {
  sm: 'h-4.5 w-4.5',
  md: 'h-5 w-5',
  lg: 'h-9 w-9'
};

export function BrandMark({ size = 'md', className = '', iconClassName = '' }: BrandMarkProps) {
  return (
    <span
      className={[
        'relative inline-flex items-center justify-center overflow-hidden border border-white/18 bg-[linear-gradient(145deg,#241b17_0%,#5f3920_100%)] text-[#fff6ed] shadow-[0_20px_34px_rgba(42,30,20,0.24)]',
        SIZE_CLASSNAME[size],
        className
      ].join(' ')}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,229,199,0.42),transparent_42%)]" />
      <span className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 rounded-full bg-[#ffd3a3]/60 blur-[3px]" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-[#e8934c]/24 blur-[4px]" />
      <span className={['relative i-lucide-sparkles', ICON_CLASSNAME[size], iconClassName].join(' ')} />
    </span>
  );
}
