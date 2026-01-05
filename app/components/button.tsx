export function Button(
  { disabled, type, label, onClick }: { disabled?: boolean; label: string; onClick?: () => void; type?: 'submit' }
) {
  return (
    <button
      className={`w-full rounded-md flex items-center justify-center px-3 h-9 ${disabled ? 'bg-gray-800 text-gray-600 pointer-events-none' : 'bg-emerald-500 hover:bg-emerald-400 focus:outline outline-emerald-400 outline-offset-2 text-white'} font-small font-bold cursor-pointer`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {label}
    </button>
  );
}
