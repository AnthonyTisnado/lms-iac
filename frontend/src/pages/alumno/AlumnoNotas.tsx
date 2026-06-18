import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';

export function AlumnoNotas() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/alumno/notas').then(r => setItems(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  const graded = items.filter(i => i.nota != null);
  return (
    <section className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Mis notas</h1><p className="text-sm text-slate-500">Notas de tareas calificadas.</p></div>
      {graded.length === 0 ? <EmptyState title="Sin notas" message="Aun no tienes entregas calificadas." /> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Clase</th><th>Tarea</th><th>Nota</th><th>Comentario</th><th>Fecha</th></tr></thead><tbody>{graded.map(e => <tr key={e.id} className="border-t border-slate-100"><td className="p-3">{e.tarea?.clase?.nombre}</td><td>{e.tarea?.titulo}</td><td className="font-semibold">{e.nota}</td><td>{e.comentario}</td><td>{e.entregadoEn ? new Date(e.entregadoEn).toLocaleString() : '-'}</td></tr>)}</tbody></table></div>}
    </section>
  );
}
