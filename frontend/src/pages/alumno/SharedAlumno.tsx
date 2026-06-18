import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';

export function ListByClass({ title, path, action }: { title: string; path: string; action?: (item: any, reload: () => void) => JSX.Element }) {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const load = () => api.get(`/alumno/clases/${id}/${path}`).then(r => setItems(r.data));
  useEffect(() => { load(); }, [id, path]);
  return <section><h1 className="mb-4 text-2xl font-semibold">{title}</h1><div className="grid gap-3">{items.map(item => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="font-semibold">{item.titulo}</div><p className="text-sm text-slate-600">{item.descripcion}</p>{item.materialUrl && <a className="text-sm text-blue-700" href={item.materialUrl} target="_blank">Ver material</a>}{item.archivoUrl && <a className="text-sm text-blue-700" href={item.archivoUrl} target="_blank">Ver archivo</a>}{item.enlaceStreaming && <a className="mt-3 inline-block rounded-md bg-green-600 px-3 py-2 text-sm text-white" href={item.enlaceStreaming} target="_blank">Ingresar a clase</a>}{action?.(item, load)}</article>)}</div></section>;
}
