import { Nav } from './nav';

export function Header() {
  return (
    <>
      <div className="h-16 shrink-0" />
      <div className="fixed top-0 left-0 w-full h-16 px-6 flex items-center justify-between bg-(--background)">
        <span className="text-lg font-bold">Mon activité vélo</span>
        <Nav />
      </div>
    </>
  );
}
