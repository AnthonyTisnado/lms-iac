import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeForBackend, isEndBeforeStart } from '../../utils/date';

export function ProfesorExamenes() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [examenId, setExamenId] = useState<number | null>(null);
  const [preguntaId, setPreguntaId] = useState<number | null>(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaFin: '' });
  const [pregunta, setPregunta] = useState({ pregunta: '', tipo: 'OPCION_MULTIPLE', puntaje: '1' });
  const [opcion, setOpcion] = useState({ texto: '', esCorrecta: false });
  const toast = useToast();
  const load = () => api.get(`/profesor/clases/${id}/examenes`).then(r => setItems(r.data));
  useEffect(() => { load(); }, [id]);
  async function crear(e: FormEvent) {
    e.preventDefault();
    const fechaInicio = formatDateTimeForBackend(form.fechaInicio);
    const fechaFin = formatDateTimeForBackend(form.fechaFin);
    if (!fechaInicio || !fechaFin) {
      toast.push('Selecciona una fecha y hora válidas.', 'error');
      return;
    }
    if (isEndBeforeStart(form.fechaInicio, form.fechaFin)) {
      toast.push('La fecha fin no puede ser menor que la fecha inicio.', 'error');
      return;
    }
    await api.post(`/profesor/clases/${id}/examenes`, { ...form, fechaInicio, fechaFin });
    setForm({ titulo: '', descripcion: '', fechaInicio: '', fechaFin: '' });
    load();
  }
  async function crearPregunta(e: FormEvent) { e.preventDefault(); if (!examenId) return; const r = await api.post(`/profesor/examenes/${examenId}/preguntas`, { ...pregunta, puntaje: Number(pregunta.puntaje) }); setPreguntaId(r.data.id); setPregunta({ pregunta: '', tipo: 'OPCION_MULTIPLE', puntaje: '1' }); }
  async function crearOpcion(e: FormEvent) { e.preventDefault(); if (!preguntaId) return; await api.post(`/profesor/preguntas/${preguntaId}/opciones`, opcion); setOpcion({ texto: '', esCorrecta: false }); }
  return (
    <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <form onSubmit={crear} className="rounded-lg border border-slate-200 bg-white p-4"><h1 className="mb-4 text-xl font-semibold">Examenes</h1><div className="space-y-3"><input placeholder="Titulo" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required /><textarea placeholder="Descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /><input type="datetime-local" aria-label="Fecha inicio" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} required /><input type="datetime-local" aria-label="Fecha fin" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} required /><button className="w-full bg-blue-700 text-white">Crear</button></div></form>
        <form onSubmit={crearPregunta} className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 font-semibold">Pregunta</h2><div className="space-y-3"><select value={examenId ?? ''} onChange={e => setExamenId(Number(e.target.value))}><option value="">Examen</option>{items.map(x => <option key={x.id} value={x.id}>{x.titulo}</option>)}</select><textarea placeholder="Pregunta" value={pregunta.pregunta} onChange={e => setPregunta({ ...pregunta, pregunta: e.target.value })} required /><input placeholder="Tipo" value={pregunta.tipo} onChange={e => setPregunta({ ...pregunta, tipo: e.target.value })} /><input placeholder="Puntaje" value={pregunta.puntaje} onChange={e => setPregunta({ ...pregunta, puntaje: e.target.value })} /><button className="w-full bg-blue-700 text-white">Crear pregunta</button></div></form>
        <form onSubmit={crearOpcion} className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 font-semibold">Opcion</h2><div className="space-y-3"><input placeholder="ID pregunta" value={preguntaId ?? ''} onChange={e => setPreguntaId(Number(e.target.value))} /><input placeholder="Texto" value={opcion.texto} onChange={e => setOpcion({ ...opcion, texto: e.target.value })} required /><label className="flex items-center gap-2 text-sm"><input className="h-4 w-4" type="checkbox" checked={opcion.esCorrecta} onChange={e => setOpcion({ ...opcion, esCorrecta: e.target.checked })} /> Correcta</label><button className="w-full bg-green-600 text-white">Crear opcion</button></div></form>
      </div>
      <div className="grid gap-3">{items.map(x => <article key={x.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="font-semibold">{x.titulo}</div><p className="text-sm text-slate-600">{x.descripcion}</p><button className="mt-3 bg-slate-100" onClick={() => setExamenId(x.id)}>Agregar preguntas</button></article>)}</div>
    </section>
  );
}
