import { useState } from 'react';
import { api } from '../../api/axios';
import { FileUpload } from '../../components/FileUpload';
import { useToast } from '../../components/ui/Toast';
import { ListByClass } from './SharedAlumno';

export function AlumnoTareas() {
  const [forms, setForms] = useState<Record<number, { archivoUrl: string; comentario: string }>>({});
  const toast = useToast();
  return <ListByClass title="Tareas" path="tareas" action={(item) => {
    const form = forms[item.id] ?? { archivoUrl: '', comentario: '' };
    return <div className="mt-4 space-y-2"><FileUpload folder="entregas" value={form.archivoUrl} onUploaded={(url) => setForms({ ...forms, [item.id]: { ...form, archivoUrl: url } })} /><div className="grid gap-2 md:grid-cols-[1fr_120px]"><input placeholder="Comentario" value={form.comentario} onChange={e => setForms({ ...forms, [item.id]: { ...form, comentario: e.target.value } })} /><button className="bg-green-600 text-white" onClick={async () => { await api.post(`/alumno/tareas/${item.id}/entregar`, form); toast.push('Registro creado correctamente'); }}>Entregar</button></div></div>;
  }} />;
}
