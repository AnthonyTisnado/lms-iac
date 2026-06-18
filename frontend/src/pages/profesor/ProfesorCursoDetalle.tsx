import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, FileText } from 'lucide-react';
import { api } from '../../api/axios';
import { CourseSidebar, type CourseTab } from '../../components/CourseSidebar';
import { FileUpload } from '../../components/FileUpload';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeForBackend, isEndBeforeStart } from '../../utils/date';
import type { Clase, Usuario } from '../../types';

interface Recurso { id: number; titulo: string; descripcion?: string; tipo: string; archivoUrl?: string; enlaceUrl?: string; orden: number; visible: boolean }
interface Modulo { id: number; numeroSemana: number; titulo?: string; descripcion?: string; fechaInicio?: string; fechaFin?: string; visible: boolean; recursos: Recurso[] }
interface Personas { profesores: Usuario[]; alumnos: Usuario[] }

const emptyModulo = { numeroSemana: '1', titulo: '', descripcion: '', fechaInicio: '', fechaFin: '', visible: true };
const emptyRecurso = { moduloId: '', titulo: '', descripcion: '', tipo: 'TEORIA', archivoUrl: '', enlaceUrl: '', orden: '1', visible: true };
const tipos = ['TEORIA', 'PRACTICA', 'LABORATORIO', 'MATERIAL', 'ENLACE', 'VIDEO'];

export function ProfesorCursoDetalle() {
  const { id } = useParams();
  const [tab, setTab] = useState<CourseTab>('inicio');
  const [clase, setClase] = useState<Clase | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [examenes, setExamenes] = useState<any[]>([]);
  const [streaming, setStreaming] = useState<any[]>([]);
  const [personas, setPersonas] = useState<Personas>({ profesores: [], alumnos: [] });
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [moduloForm, setModuloForm] = useState(emptyModulo);
  const [recursoForm, setRecursoForm] = useState(emptyRecurso);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    const [clases, mods, tasks, exams, streams, people] = await Promise.all([
      api.get('/profesor/clases'),
      api.get(`/profesor/clases/${id}/modulos`),
      api.get(`/profesor/clases/${id}/tareas`),
      api.get(`/profesor/clases/${id}/examenes`),
      api.get(`/profesor/clases/${id}/streaming`),
      api.get(`/profesor/clases/${id}/personas`)
    ]);
    setClase((clases.data as Clase[]).find(c => String(c.id) === id) ?? null);
    setModulos(mods.data);
    setTareas(tasks.data);
    setExamenes(exams.data);
    setStreaming(streams.data);
    setPersonas(people.data);
    setOpen(current => Object.keys(current).length ? current : Object.fromEntries((mods.data as Modulo[]).map(m => [m.id, true])));
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const files = useMemo(() => modulos.flatMap(m => m.recursos), [modulos]);
  if (loading) return <Loading />;

  return (
    <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <CourseSidebar activeTab={tab} onTabChange={setTab} backTo="/profesor/clases" backLabel="Volver a mis clases" />
      <main className="space-y-5">
        <Header clase={clase} alumnos={personas.alumnos.length} />
        {tab === 'inicio' && <Inicio alumnos={personas.alumnos.length} tareas={tareas} examenes={examenes} streaming={streaming} files={files} setTab={setTab} />}
        {tab === 'modulos' && <Modulos modulos={modulos} open={open} setOpen={setOpen} moduloForm={moduloForm} setModuloForm={setModuloForm} recursoForm={recursoForm} setRecursoForm={setRecursoForm} crearModulo={crearModulo} crearRecurso={crearRecurso} toggleModulo={toggleModulo} toggleRecurso={toggleRecurso} eliminarModulo={eliminarModulo} eliminarRecurso={eliminarRecurso} />}
        {tab === 'personas' && <PersonasView personas={personas} />}
        {tab === 'tareas' && <TareasView claseId={id!} tareas={tareas} />}
        {tab === 'evaluaciones' && <EvaluacionesView claseId={id!} examenes={examenes} />}
        {tab === 'streaming' && <StreamingView claseId={id!} items={streaming} refresh={load} />}
        {tab === 'archivos' && <ArchivosView files={files} />}
        {tab === 'calificaciones' && <CalificacionesView alumnos={personas.alumnos} />}
      </main>
    </section>
  );

  async function crearModulo(e: FormEvent) {
    e.preventDefault();
    if (isEndBeforeStart(moduloForm.fechaInicio, moduloForm.fechaFin)) return toast.push('La fecha fin no puede ser menor que la fecha inicio.', 'error');
    await api.post(`/profesor/clases/${id}/modulos`, { numeroSemana: Number(moduloForm.numeroSemana), titulo: moduloForm.titulo, descripcion: moduloForm.descripcion, fechaInicio: formatDateTimeForBackend(moduloForm.fechaInicio), fechaFin: formatDateTimeForBackend(moduloForm.fechaFin), visible: moduloForm.visible });
    setModuloForm(emptyModulo); toast.push('Registro creado correctamente'); load();
  }
  async function crearRecurso(e: FormEvent) {
    e.preventDefault();
    if (!recursoForm.moduloId) return;
    await api.post(`/profesor/modulos/${recursoForm.moduloId}/recursos`, { ...recursoForm, orden: Number(recursoForm.orden) });
    setRecursoForm(emptyRecurso); toast.push('Registro creado correctamente'); load();
  }
  async function toggleModulo(m: Modulo) { await api.patch(`/profesor/modulos/${m.id}/visible`, { estado: !m.visible }); toast.push('Registro actualizado correctamente'); load(); }
  async function toggleRecurso(r: Recurso) { await api.patch(`/profesor/recursos/${r.id}/visible`, { estado: !r.visible }); toast.push('Registro actualizado correctamente'); load(); }
  async function eliminarModulo(m: Modulo) { if (!confirm('Eliminar semana y todos sus recursos?')) return; await api.delete(`/profesor/modulos/${m.id}`); toast.push('Registro eliminado correctamente'); load(); }
  async function eliminarRecurso(r: Recurso) { if (!confirm('Eliminar recurso?')) return; await api.delete(`/profesor/recursos/${r.id}`); toast.push('Registro eliminado correctamente'); load(); }
}

function Header({ clase, alumnos }: { clase: Clase | null; alumnos: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5"><h1 className="text-2xl font-semibold">{clase?.nombre ?? 'Gestionar curso'}</h1><p className="text-sm text-slate-500">{clase?.curso?.nombre} · {alumnos} alumnos</p></div>;
}

function Inicio({ alumnos, tareas, examenes, streaming, files, setTab }: any) {
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-4"><Metric label="Alumnos" value={alumnos} /><Metric label="Tareas" value={tareas.length} /><Metric label="Evaluaciones" value={examenes.length} /><Metric label="En vivo" value={streaming.length} /></div><div className="grid gap-4 lg:grid-cols-2"><Panel title="Proximos eventos" items={[streaming.find((s: any) => s.estado !== 'FINALIZADA')?.titulo, tareas.find((t: any) => !isPast(t.fechaEntrega))?.titulo, examenes.find((e: any) => !isPast(e.fechaFin))?.titulo].filter(Boolean)} /><Panel title="Ultimos materiales" items={files.slice(-5).map((f: any) => f.titulo)} /></div><div className="flex flex-wrap gap-2"><Quick onClick={() => setTab('modulos')}>Agregar modulo</Quick><Quick onClick={() => setTab('tareas')}>Crear tarea</Quick><Quick onClick={() => setTab('evaluaciones')}>Crear evaluacion</Quick><Quick onClick={() => setTab('streaming')}>Programar clase en vivo</Quick></div></div>;
}

function Modulos({ modulos, open, setOpen, moduloForm, setModuloForm, recursoForm, setRecursoForm, crearModulo, crearRecurso, toggleModulo, toggleRecurso, eliminarModulo, eliminarRecurso }: any) {
  return <div className="space-y-5"><div className="grid gap-4 xl:grid-cols-2"><Card><h2 className="mb-3 font-semibold">Crear semana</h2><form onSubmit={crearModulo} className="space-y-3"><input type="number" min="1" value={moduloForm.numeroSemana} onChange={e => setModuloForm({ ...moduloForm, numeroSemana: e.target.value })} required /><input placeholder="Titulo opcional" value={moduloForm.titulo} onChange={e => setModuloForm({ ...moduloForm, titulo: e.target.value })} /><textarea placeholder="Descripcion" value={moduloForm.descripcion} onChange={e => setModuloForm({ ...moduloForm, descripcion: e.target.value })} /><div className="grid gap-2 md:grid-cols-2"><input type="datetime-local" value={moduloForm.fechaInicio} onChange={e => setModuloForm({ ...moduloForm, fechaInicio: e.target.value })} /><input type="datetime-local" value={moduloForm.fechaFin} onChange={e => setModuloForm({ ...moduloForm, fechaFin: e.target.value })} /></div><label className="flex items-center gap-2 text-sm"><input className="h-4 w-4" type="checkbox" checked={moduloForm.visible} onChange={e => setModuloForm({ ...moduloForm, visible: e.target.checked })} /> Visible</label><Button>Crear semana</Button></form></Card><Card><h2 className="mb-3 font-semibold">Crear recurso</h2><form onSubmit={crearRecurso} className="space-y-3"><select value={recursoForm.moduloId} onChange={e => setRecursoForm({ ...recursoForm, moduloId: e.target.value })} required><option value="">Semana</option>{modulos.map((m: Modulo) => <option key={m.id} value={m.id}>Semana {m.numeroSemana}</option>)}</select><input placeholder="Titulo" value={recursoForm.titulo} onChange={e => setRecursoForm({ ...recursoForm, titulo: e.target.value })} required /><textarea placeholder="Descripcion" value={recursoForm.descripcion} onChange={e => setRecursoForm({ ...recursoForm, descripcion: e.target.value })} /><select value={recursoForm.tipo} onChange={e => setRecursoForm({ ...recursoForm, tipo: e.target.value })}>{tipos.map(t => <option key={t}>{t}</option>)}</select><FileUpload folder="recursos" value={recursoForm.archivoUrl} onUploaded={(url) => setRecursoForm({ ...recursoForm, archivoUrl: url })} /><input placeholder="Enlace URL" value={recursoForm.enlaceUrl} onChange={e => setRecursoForm({ ...recursoForm, enlaceUrl: e.target.value })} /><input type="number" min="1" value={recursoForm.orden} onChange={e => setRecursoForm({ ...recursoForm, orden: e.target.value })} /><Button>Crear recurso</Button></form></Card></div>{modulos.map((m: Modulo) => <div key={m.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white"><button className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left" onClick={() => setOpen({ ...open, [m.id]: !open[m.id] })}><span className="font-semibold">Semana {m.numeroSemana}{m.titulo ? ` - ${m.titulo}` : ''} <span className={m.visible ? 'text-green-700' : 'text-red-700'}>{m.visible ? 'visible' : 'oculta'}</span></span><ChevronDown size={18} /></button>{open[m.id] && <div className="space-y-3 p-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => toggleModulo(m)}>{m.visible ? 'Ocultar' : 'Mostrar'}</Button><Button variant="danger" onClick={() => eliminarModulo(m)}>Eliminar</Button></div>{m.recursos.map(r => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"><FileRow title={`${r.tipo} · ${r.titulo}`} url={r.archivoUrl} enlace={r.enlaceUrl} /><div className="flex gap-2"><Button variant="secondary" onClick={() => toggleRecurso(r)}>{r.visible ? 'Ocultar' : 'Mostrar'}</Button><Button variant="danger" onClick={() => eliminarRecurso(r)}>Eliminar</Button></div></div>)}</div>}</div>)}</div>;
}

function PersonasView({ personas }: { personas: Personas }) {
  return <div className="space-y-4"><People title="PROFESORES" items={personas.profesores} /><People title="ALUMNOS" items={personas.alumnos} /></div>;
}
function TareasView({ claseId, tareas }: any) { return <div className="space-y-3"><Link className="inline-block rounded-md bg-blue-700 px-3 py-2 text-sm text-white" to={`/profesor/clases/${claseId}/tareas`}>Crear tarea</Link>{tareas.map((t: any) => <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="font-semibold">{t.titulo}</h3><p className="text-sm text-slate-600">{t.descripcion}</p><p className="text-sm text-slate-500">Fecha limite: {fmt(t.fechaEntrega)} · Puntaje: -</p>{t.archivoUrl && <FileRow title="Archivo adjunto" url={t.archivoUrl} />}<Link className="mt-3 inline-block rounded-md bg-slate-100 px-3 py-2 text-sm" to={`/profesor/clases/${claseId}/tareas`}>Ver entregas</Link></div>)}</div>; }
function EvaluacionesView({ claseId, examenes }: any) { return <div className="space-y-3"><Link className="inline-block rounded-md bg-blue-700 px-3 py-2 text-sm text-white" to={`/profesor/clases/${claseId}/examenes`}>Crear evaluacion</Link>{examenes.map((e: any) => <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="font-semibold">{e.titulo}</h3><p className="text-sm text-slate-600">{e.descripcion}</p><p className="text-sm text-slate-500">{fmt(e.fechaInicio)} - {fmt(e.fechaFin)}</p><Badge>{estadoExamen(e)}</Badge></div>)}</div>; }
function StreamingView({ claseId, items, refresh }: any) { async function setEstado(id: number, estado: string) { await api.patch(`/profesor/streaming/${id}/estado`, { estado }); refresh(); } return <div className="space-y-3"><Link className="inline-block rounded-md bg-blue-700 px-3 py-2 text-sm text-white" to={`/profesor/clases/${claseId}/streaming`}>Programar clase en vivo</Link>{items.map((s: any) => <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{s.titulo}</h3><p className="text-sm text-slate-600">{s.descripcion}</p><p className="text-sm text-slate-500">{fmt(s.fechaInicio)}</p></div><Badge>{s.estado}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><a className="rounded-md bg-slate-100 px-3 py-2 text-sm" href={s.enlaceStreaming} target="_blank">Abrir enlace</a><Button variant="success" onClick={() => setEstado(s.id, 'EN_VIVO')}>Iniciar</Button><Button variant="danger" onClick={() => setEstado(s.id, 'FINALIZADA')}>Finalizar</Button></div></div>)}</div>; }
function ArchivosView({ files }: { files: Recurso[] }) { return files.length === 0 ? <EmptyState title="Sin archivos" /> : <div className="space-y-2">{files.map(f => <FileRow key={f.id} title={`${f.tipo} · ${f.titulo}`} url={f.archivoUrl} enlace={f.enlaceUrl} />)}</div>; }
function CalificacionesView({ alumnos }: { alumnos: Usuario[] }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 font-semibold">Resumen por alumno</h2>{alumnos.map(a => <div key={a.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">{a.nombres} {a.apellidos} · Promedio pendiente de calculo</div>)}</div>; }

function People({ title, items }: { title: string; items: Usuario[] }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 text-sm font-semibold text-slate-500">{title}</h2><div className="grid gap-2 md:grid-cols-2">{items.map(p => <Person key={p.id} p={p} />)}</div></div>; }
function Person({ p }: { p: Usuario }) { const initials = `${p.nombres?.[0] ?? ''}${p.apellidos?.[0] ?? ''}`.toUpperCase(); return <div className="flex items-center gap-3 rounded-md border border-slate-200 p-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-950 text-sm font-semibold text-white">{initials}</div><div><div className="font-medium">{p.nombres} {p.apellidos}</div><div className="text-sm text-slate-500">{p.email}</div><div className="text-xs text-slate-500">{p.rol} · {p.estado ? 'Activo' : 'Inactivo'}</div></div></div>; }
function FileRow({ title, url, enlace }: { title: string; url?: string; enlace?: string }) { return <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"><div className="flex items-center gap-2"><FileText size={16} className="text-blue-700" /><span>{title}</span></div><div className="flex gap-3">{url && <><Link className="text-blue-700" to={`/viewer/pdf?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>Ver</Link><a className="text-blue-700" href={url} download>Descargar</a></>}{enlace && <a className="text-blue-700" href={enlace} target="_blank">Abrir enlace</a>}</div></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><div className="text-sm text-slate-500">{label}</div><div className="text-2xl font-semibold">{value}</div></div>; }
function Panel({ title, items }: { title: string; items: any[] }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 font-semibold">{title}</h2>{items.length ? items.map((i, idx) => <div key={idx} className="rounded-md bg-slate-50 px-3 py-2 text-sm">{i}</div>) : <p className="text-sm text-slate-500">Sin informacion.</p>}</div>; }
function Quick({ children, onClick }: any) { return <button className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white" onClick={onClick}>{children}</button>; }
function Badge({ children }: any) { return <span className="h-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{children}</span>; }
function fmt(value?: string) { return value ? new Date(value).toLocaleString() : '-'; }
function isPast(value?: string) { return value ? new Date(value).getTime() < Date.now() : false; }
function estadoExamen(e: any) { const now = Date.now(); if (e.fechaInicio && new Date(e.fechaInicio).getTime() > now) return 'Proximamente'; if (e.fechaFin && new Date(e.fechaFin).getTime() < now) return 'Cerrada'; return 'Disponible'; }
