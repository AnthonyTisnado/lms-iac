import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';

interface AlumnoClase {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  estado: boolean;
  tareasEntregadas: number;
  promedio?: number | null;
}

export function ProfesorAlumnos() {
  const { id } = useParams();
  const [items, setItems] = useState<AlumnoClase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profesor/clases/${id}/alumnos`).then(r => setItems(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  return (
    <section className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Alumnos de la clase</h1><p className="text-sm text-slate-500">Consulta matriculas, entregas y promedio.</p></div>
      {items.length === 0 ? <EmptyState title="Sin alumnos" message="Esta clase aun no tiene alumnos matriculados." /> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Alumno</th><th>Email</th><th>Estado</th><th>Entregas</th><th>Promedio</th></tr></thead><tbody>{items.map(a => <tr key={a.id} className="border-t border-slate-100"><td className="p-3 font-medium">{a.nombres} {a.apellidos}</td><td>{a.email}</td><td>{a.estado ? 'Activo' : 'Inactivo'}</td><td>{a.tareasEntregadas}</td><td>{a.promedio ?? '-'}</td></tr>)}</tbody></table></div>}
    </section>
  );
}
