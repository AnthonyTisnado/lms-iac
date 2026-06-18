import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import type { Clase } from '../../types';

export function AlumnoClases() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alumno/clases').then(r => setClases(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (clases.length === 0) return <EmptyState title="Sin clases matriculadas" message="Aun no tienes clases asignadas." />;

  return (
    <section className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Mis clases</h1><p className="text-sm text-slate-500">Solo ves clases donde estas matriculado.</p></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clases.map(c => <Card key={c.id}><div className="font-semibold">{c.nombre}</div><div className="text-sm text-slate-600">{c.curso?.nombre}</div><div className="text-sm text-slate-500">Profesor: {c.profesor?.nombres} {c.profesor?.apellidos}</div><div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm"><Link className="col-span-2 rounded-md bg-blue-700 p-2 text-white" to={`/alumno/clases/${c.id}/curso`}>Entrar al curso</Link><Link className="rounded-md bg-slate-100 p-2" to={`/alumno/clases/${c.id}/sesiones`}>Sesiones</Link><Link className="rounded-md bg-slate-100 p-2" to={`/alumno/clases/${c.id}/tareas`}>Tareas</Link><Link className="rounded-md bg-slate-100 p-2" to={`/alumno/clases/${c.id}/examenes`}>Examenes</Link><Link className="rounded-md bg-slate-100 p-2" to={`/alumno/clases/${c.id}/streaming`}>Streaming</Link></div></Card>)}
      </div>
    </section>
  );
}
