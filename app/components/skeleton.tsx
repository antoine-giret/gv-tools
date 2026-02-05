export function Skeleton({
  width,
  ...props
}: { width: string } & (
  | { align?: 'center'; size: 'lg' | 'sm'; variant: 'text' }
  | { height: string; variant: 'circular' }
  | { height: string; variant: 'rounded' }
)) {
  if (props.variant === 'rounded') {
    const { height } = props;

    return (
      <div className={`animate-pulse ${height} ${width} bg-black/30 dark:bg-white/30 rounded-sm`} />
    );
  }

  if (props.variant === 'circular') {
    const { height } = props;

    return (
      <div className="animate-pulse flex items-center justify-center h-full w-full">
        <div className={`${height} ${width} bg-black/30 dark:bg-white/30 rounded-full`} />
      </div>
    );
  }

  const { size, align } = props;
  const wrapperClassName = [
    size === 'lg' ? 'h-7' : 'h-6',
    align === 'center' ? 'justify-center' : '',
  ].join(' ');
  const className = size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className={`animate-pulse flex items-center w-full ${wrapperClassName}`}>
      <div className={`${className} ${width} bg-black/30 dark:bg-white/30 rounded-full`} />
    </div>
  );
}
