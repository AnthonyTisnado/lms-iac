import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardList } from 'lucide-react';
import { api } from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import type { DashboardAdmin } from '../../types';
import type { LucideIcon } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState<DashboardAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const cards: Array<[string, number, LucideIcon]> = [
    ['Usuarios', data?.totalUsuarios ?? 0, Users],
    ['Administradores', data?.totalAdministradores ?? 0, Users],
    ['Profesores', data?.totalProfesores ?? 0, GraduationCap],
    ['Alumnos', data?.totalAlumnos ?? 0, Users],
    ['Cursos', data?.totalCursos ?? 0, BookOpen],
    ['Clases', data?.totalClases ?? 0, GraduationCap],
    ['Tareas', data?.totalTareas ?? 0, ClipboardList],
    ['Examenes', data?.totalExamenes ?? 0, ClipboardList]
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard administrador</h1>
        <p className="text-sm text-slate-500">Resumen operativo del LMSIAC.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => {
          const IconCmp = Icon as typeof Users;
          return (
            <Card key={String(label)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-2 text-3xl font-semibold text-blue-950">{String(value)}</div>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-blue-700"><IconCmp size={22} /></div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Recent title="Ultimos usuarios" items={(data?.ultimosUsuarios ?? []).map(u => `${u.nombres} ${u.apellidos} · ${u.rol}`)} />
        <Recent title="Ultimos cursos" items={(data?.ultimosCursos ?? []).map(c => c.nombre)} />
        <Recent title="Ultimas clases" items={(data?.ultimasClases ?? []).map(c => `${c.nombre} · ${c.curso}`)} />
      </div>
    </section>
  );
}

function Recent({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-slate-500">Sin actividad reciente.</p>}
        {items.map((item, index) => <div key={`${item}-${index}`} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>)}
      </div>
    </Card>
  );
}
