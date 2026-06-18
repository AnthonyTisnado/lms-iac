import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { FileUpload } from '../../components/FileUpload';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeForBackend } from '../../utils/date';

export function CrudByClass({ title, path, fields, onSelect }: { title: string; path: string; fields: [string, string][]; onSelect?: (id: number) => void }) {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const toast = useToast();
  const load = () => api.get(`/profesor/clases/${id}/${path}`).then(r => setItems(r.data));
  useEffect(() => { load(); }, [id, path]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const dateFields = ['fecha', 'fechaEntrega', 'fechaInicio'];
    const payload = { ...form };
    for (const field of dateFields) {
      if (field in payload) {
        const formatted = formatDateTimeForBackend(payload[field]);
        const required = field === 'fechaEntrega' || field === 'fechaInicio';
        if (required && !formatted) {
          toast.push('Selecciona una fecha y hora válidas.', 'error');
          return;
        }
        if (formatted) payload[field] = formatted;
        else delete payload[field];
      }
    }
    await api.post(`/profesor/clases/${id}/${path}`, payload);
    setForm({});
    load();
  }
  const folder = path === 'sesiones' ? 'sesiones' : path === 'tareas' ? 'tareas' : undefined;
  return (
    <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        <div className="space-y-3">{fields.map(([name, label]) => {
          const isFile = (name === 'materialUrl' || name === 'archivoUrl') && folder;
          const isDate = ['fecha', 'fechaEntrega', 'fechaInicio'].includes(name);
          const required = name === 'titulo' || name === 'fechaEntrega' || name === 'fechaInicio';
          return <div key={name}>{isFile && <FileUpload folder={folder} value={form[name]} onUploaded={(url) => setForm({ ...form, [name]: url })} />}<input type={isDate ? 'datetime-local' : 'text'} placeholder={label} value={form[name] ?? ''} onChange={e => setForm({ ...form, [name]: e.target.value })} required={required} /></div>;
        })}<button className="w-full bg-blue-700 text-white hover:bg-blue-800">Crear</button></div>
      </form>
      <div className="grid gap-3">
        {items.map(item => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><div className="font-semibold">{item.titulo}</div><p className="text-sm text-slate-600">{item.descripcion}</p></div>{onSelect && <button className="bg-slate-100" onClick={() => onSelect(item.id)}>Ver entregas</button>}</div>{item.materialUrl && <div className="mt-2 flex gap-3 text-sm"><a className="text-blue-700" href={item.materialUrl} target="_blank">Ver archivo</a><a className="text-blue-700" href={item.materialUrl} download>Descargar archivo</a></div>}{item.archivoUrl && <div className="mt-2 flex gap-3 text-sm"><a className="text-blue-700" href={item.archivoUrl} target="_blank">Ver archivo</a><a className="text-blue-700" href={item.archivoUrl} download>Descargar archivo</a></div>}</article>)}
      </div>
    </section>
  );
}
