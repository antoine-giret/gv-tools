export function Card({
  id,
  children,
}: Readonly<{
  children: React.ReactNode;
  id?: string;
}>) {
  return (
    <div className="border border-black/20 dark:border-white/20 rounded-md" id={id}>
      {children}
    </div>
  );
}
