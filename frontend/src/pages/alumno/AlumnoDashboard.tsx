import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Radio, Users } from 'lucide-react';
import { api } from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import type { Clase } from '../../types';
import type { LucideIcon } from 'lucide-react';

interface DashboardAlumno {
  totalClases: number;
  tareasPendientes: number;
  tareasEntregadas: number;
  examenesDisponibles: number;
  proximasClasesVivo: number;
  ultimasNotas: Array<{ id: number; curso: string; claseNombre: string; titulo: string; nota: number; comentario?: string }>;
}

export function AlumnoDashboard() {
  const [dashboard, setDashboard] = useState<DashboardAlumno | null>(null);
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/alumno/dashboard'), api.get('/alumno/clases')])
      .then(([d, c]) => { setDashboard(d.data); setClases(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const cards: Array<[string, number, LucideIcon]> = [
    ['Mis clases', dashboard?.totalClases ?? 0, BookOpen],
    ['Tareas pendientes', dashboard?.tareasPendientes ?? 0, ClipboardList],
    ['Tareas entregadas', dashboard?.tareasEntregadas ?? 0, ClipboardList],
    ['Examenes disponibles', dashboard?.examenesDisponibles ?? 0, ClipboardList],
    ['Clases en vivo', dashboard?.proximasClasesVivo ?? 0, Radio]
  ];

  return (
    <section className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Dashboard alumno</h1><p className="text-sm text-slate-500">Accede a tus clases, tareas, examenes y notas.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value, Icon]) => <Card key={label}><div className="flex items-center justify-between"><div><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold text-blue-950">{value}</div></div><div className="rounded-md bg-blue-50 p-3 text-blue-700"><Icon size={22} /></div></div></Card>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-semibold">Accesos rapidos</h2><div className="grid gap-2 sm:grid-cols-3">{clases[0] ? <><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/alumno/clases/${clases[0].id}/tareas`}>Ver tareas</Link><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/alumno/clases/${clases[0].id}/examenes`}>Ver examenes</Link><Link className="rounded-md bg-slate-100 p-3 text-center text-sm hover:bg-slate-200" to={`/alumno/clases/${clases[0].id}/streaming`}>Clases en vivo</Link></> : <p className="text-sm text-slate-500">No tienes clases matriculadas.</p>}</div></Card>
        <Card><h2 className="mb-3 font-semibold">Ultimas notas</h2><div className="space-y-2">{(dashboard?.ultimasNotas ?? []).length === 0 && <p className="text-sm text-slate-500">Aun no tienes notas.</p>}{dashboard?.ultimasNotas.map(n => <div key={n.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"><span>{n.titulo}</span><span className="font-semibold">{n.nota}</span></div>)}</div></Card>
      </div>
    </section>
  );
}
