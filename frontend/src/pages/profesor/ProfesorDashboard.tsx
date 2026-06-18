import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Radio, Users } from 'lucide-react';
import { api } from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import type { Clase } from '../../types';
import type { LucideIcon } from 'lucide-react';

interface DashboardProfesor {
  totalClases: number;
  totalAlumnos: number;
  tareasCreadas: number;
  tareasPendientesRevision: number;
  examenesCreados: number;
  proximasClasesVivo: number;
}

export function ProfesorDashboard() {
  const [dashboard, setDashboard] = useState<DashboardProfesor | null>(null);
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/profesor/dashboard'), api.get('/profesor/clases')])
      .then(([d, c]) => { setDashboard(d.data); setClases(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const cards: Array<[string, number, LucideIcon]> = [
    ['Mis clases', dashboard?.totalClases ?? 0, BookOpen],
    ['Alumnos', dashboard?.totalAlumnos ?? 0, Users],
    ['Tareas', dashboard?.tareasCreadas ?? 0, ClipboardList],
    ['Pendientes', dashboard?.tareasPendientesRevision ?? 0, ClipboardList],
    ['Examenes', dashboard?.examenesCreados ?? 0, ClipboardList],
    ['En vivo', dashboard?.proximasClasesVivo ?? 0, Radio]
  ];

  return (
    <section className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Dashboard profesor</h1><p className="text-sm text-slate-500">Gestiona tus clases asignadas.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value, Icon]) => { const I = Icon as typeof BookOpen; return <Card key={String(label)}><div className="flex items-center justify-between"><div><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold text-blue-950">{String(value)}</div></div><div className="rounded-md bg-blue-50 p-3 text-blue-700"><I size={22} /></div></div></Card>; })}</div>
      <Card>
        <h2 className="mb-3 font-semibold">Accesos rapidos</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {clases[0] && <><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/profesor/clases/${clases[0].id}/sesiones`}>Crear sesion</Link><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/profesor/clases/${clases[0].id}/tareas`}>Crear tarea</Link><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/profesor/clases/${clases[0].id}/examenes`}>Crear examen</Link><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/profesor/clases/${clases[0].id}/streaming`}>Programar streaming</Link></>}
          {!clases[0] && <p className="text-sm text-slate-500">No tienes clases asignadas.</p>}
        </div>
      </Card>
    </section>
  );
}
