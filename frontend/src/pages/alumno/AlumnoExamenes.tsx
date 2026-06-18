import { useState } from 'react';
import { api } from '../../api/axios';
import { ListByClass } from './SharedAlumno';

export function AlumnoExamenes() {
  const [preguntas, setPreguntas] = useState<Record<number, any[]>>({});
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  async function cargar(examenId: number) {
    const { data } = await api.get(`/alumno/examenes/${examenId}/preguntas`);
    setPreguntas({ ...preguntas, [examenId]: data });
  }
  async function enviar(examenId: number) {
    const items = (preguntas[examenId] ?? []).map(p => ({ preguntaId: p.id, respuesta: respuestas[p.id] ?? '' }));
    await api.post(`/alumno/examenes/${examenId}/responder`, { respuestas: items });
  }
  return <ListByClass title="Examenes" path="examenes" action={(item) => <div className="mt-4 space-y-3"><button className="bg-slate-100" onClick={() => cargar(item.id)}>Responder</button>{(preguntas[item.id] ?? []).map(p => <label key={p.id} className="block text-sm font-medium">{p.pregunta}<textarea className="mt-1" value={respuestas[p.id] ?? ''} onChange={e => setRespuestas({ ...respuestas, [p.id]: e.target.value })} /></label>)}{preguntas[item.id] && <button className="bg-green-600 text-white" onClick={() => enviar(item.id)}>Enviar respuestas</button>}</div>} />;
}
