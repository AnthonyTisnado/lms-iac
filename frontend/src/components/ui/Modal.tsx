import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Cerrar"><X size={18} /></Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
