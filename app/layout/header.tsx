import { Nav } from './nav';

export function Header() {
  return (
    <div className="h-16 shrink-0 px-6 flex items-center justify-between">
      <span className="text-lg font-bold">Mon activité vélo</span>
      <Nav />
    </div>
  );
}
