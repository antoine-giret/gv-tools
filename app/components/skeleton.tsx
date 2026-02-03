export function Skeleton({
  width,
  ...props
}: { width: string } & ({ variant: 'text' } | { variant: 'circular'; height: string })) {
  if (props.variant === 'circular') {
    const { height } = props;

    return (
      <div className="animate-pulse flex items-center justify-center h-full w-full">
        <div className={`${height} ${width} bg-black/30 dark:bg-white/30 rounded-full`} />
      </div>
    );
  }

  return (
    <div className="animate-pulse flex items-center justify-center h-7 w-full">
      <div className={`h-4 ${width} bg-black/30 dark:bg-white/30 rounded-full`} />
    </div>
  );
}
