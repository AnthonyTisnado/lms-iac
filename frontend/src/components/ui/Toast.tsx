import { createContext, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; type: ToastType; message: string }

const ToastContext = createContext<{ push: (message: string, type?: ToastType) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  function push(message: string, type: ToastType = 'success') {
    const id = Date.now();
    setItems(current => [...current, { id, message, type }]);
    window.setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 3500);
  }
  const value = useMemo(() => ({ push }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {items.map(item => (
          <div key={item.id} className={`rounded-md px-4 py-3 text-sm shadow-lg ${item.type === 'error' ? 'bg-red-600 text-white' : item.type === 'info' ? 'bg-blue-700 text-white' : 'bg-green-600 text-white'}`}>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('ToastProvider no disponible');
  return ctx;
}
