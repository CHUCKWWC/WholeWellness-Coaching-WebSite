import { useEffect, useRef, useState } from "react";

export default function LegalMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="px-3 py-1 rounded-lg border text-sm"
      >
        Legal
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-1 text-sm z-50"
        >
          <a role="menuitem" className="block px-3 py-2 hover:bg-gray-50 rounded-lg" href="/privacy">Privacy Policy</a>
          <a role="menuitem" className="block px-3 py-2 hover:bg-gray-50 rounded-lg" href="/terms">Terms of Service</a>
        </div>
      )}
    </div>
  );
}
