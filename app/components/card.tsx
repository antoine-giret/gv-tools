export function Card({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="border border-black/20 dark:border-white/20 rounded-md">{children}</div>;
}
