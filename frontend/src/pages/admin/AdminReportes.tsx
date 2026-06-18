import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import type { ReportesAdmin } from '../../types';

export function AdminReportes() {
  const [data, setData] = useState<ReportesAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reportes').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Reportes</h1><p className="text-sm text-slate-500">Indicadores generales del LMSIAC.</p></div>
        <Button variant="secondary" disabled><Download size={16} className="mr-2 inline" /> Exportar Excel</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Alumnos activos" value={data?.alumnosActivos ?? 0} />
        <Metric label="Clases activas" value={data?.clasesActivas ?? 0} />
        <Metric label="Tareas creadas" value={data?.tareasCreadas ?? 0} />
        <Metric label="Examenes creados" value={data?.examenesCreados ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-semibold">Cursos con mas clases</h2><div className="space-y-2">{(data?.cursosConMasAlumnos ?? []).map(c => <div key={c.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"><span>{c.nombre}</span><span>{c.totalClases ?? 0}</span></div>)}</div></Card>
        <Card><h2 className="mb-3 font-semibold">Profesores con mas clases</h2><div className="space-y-2">{(data?.profesoresConMasClases ?? []).map(p => <div key={p.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"><span>{p.nombreCompleto}</span><span>{p.totalClases}</span></div>)}</div></Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold text-blue-950">{value}</div></Card>;
}
