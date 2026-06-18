export function EmptyState({ title = 'Sin registros', message = 'No hay informacion para mostrar.' }: { title?: string; message?: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><div className="font-semibold text-slate-700">{title}</div><p className="mt-1 text-sm text-slate-500">{message}</p></div>;
}
