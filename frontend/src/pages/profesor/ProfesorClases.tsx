import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import type { Clase } from '../../types';

type ClaseRow = Clase & { totalAlumnos?: number };

export function ProfesorClases() {
  const [clases, setClases] = useState<ClaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profesor/clases').then(async r => {
      const withCounts = await Promise.all((r.data as Clase[]).map(async c => {
        const alumnos = await api.get(`/profesor/clases/${c.id}/alumnos`);
        return { ...c, totalAlumnos: alumnos.data.length };
      }));
      setClases(withCounts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (clases.length === 0) return <EmptyState title="Sin clases asignadas" message="Aun no tienes aulas asignadas por administracion." />;

  return (
    <section className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Mis clases</h1><p className="text-sm text-slate-500">Solo se muestran clases asignadas a tu usuario.</p></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clases.map(c => <Card key={c.id}><div className="font-semibold">{c.nombre}</div><div className="text-sm text-slate-600">{c.curso?.nombre}</div><div className="mt-2 text-sm text-slate-500">{c.totalAlumnos ?? 0} alumnos</div><div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm"><Link className="col-span-2 rounded-md bg-blue-700 p-2 text-white" to={`/profesor/clases/${c.id}/curso`}>Gestionar curso</Link><Link className="rounded-md bg-slate-100 p-2" to={`/profesor/clases/${c.id}/sesiones`}>Sesiones</Link><Link className="rounded-md bg-slate-100 p-2" to={`/profesor/clases/${c.id}/tareas`}>Tareas</Link><Link className="rounded-md bg-slate-100 p-2" to={`/profesor/clases/${c.id}/examenes`}>Examenes</Link><Link className="rounded-md bg-slate-100 p-2" to={`/profesor/clases/${c.id}/streaming`}>Streaming</Link><Link className="col-span-2 rounded-md bg-slate-100 p-2" to={`/profesor/clases/${c.id}/alumnos`}>Alumnos</Link></div></Card>)}
      </div>
    </section>
  );
}
