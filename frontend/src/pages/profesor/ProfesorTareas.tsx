import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { CrudByClass } from './SharedProfesor';

export function ProfesorTareas() {
  const { id } = useParams();
  const [tareaId, setTareaId] = useState<number | null>(null);
  const [entregas, setEntregas] = useState<any[]>([]);
  useEffect(() => { if (tareaId) api.get(`/profesor/tareas/${tareaId}/entregas`).then(r => setEntregas(r.data)); }, [tareaId]);
  async function calificar(entregaId: number, nota: string) {
    await api.patch(`/profesor/entregas/${entregaId}/calificar`, { nota: Number(nota), estado: 'CALIFICADO' });
    if (tareaId) api.get(`/profesor/tareas/${tareaId}/entregas`).then(r => setEntregas(r.data));
  }
  return <div className="space-y-5"><CrudByClass title="Tareas" path="tareas" fields={[['titulo', 'Titulo'], ['descripcion', 'Descripcion'], ['archivoUrl', 'Archivo URL'], ['fechaEntrega', 'Fecha entrega']]} onSelect={setTareaId} /><section className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 text-lg font-semibold">Entregas</h2>{!tareaId && <p className="text-sm text-slate-500">Selecciona una tarea.</p>}{entregas.map(e => <div key={e.id} className="grid gap-2 border-t py-3 md:grid-cols-[1fr_120px_120px]"><div><div className="font-medium">{e.alumno?.nombres} {e.alumno?.apellidos}</div>{e.archivoUrl && <div className="flex gap-3 text-sm"><a className="text-blue-700" href={e.archivoUrl} target="_blank">Ver archivo</a><a className="text-blue-700" href={e.archivoUrl} download>Descargar archivo</a></div>}<p className="text-sm text-slate-600">{e.comentario}</p></div><input id={`nota-${e.id}`} defaultValue={e.nota ?? ''} placeholder="Nota" /><button className="bg-green-600 text-white" onClick={() => calificar(e.id, (document.getElementById(`nota-${e.id}`) as HTMLInputElement).value)}>Calificar</button></div>)}</section></div>;
}
