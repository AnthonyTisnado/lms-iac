import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, FileText } from 'lucide-react';
import { api } from '../../api/axios';
import { CourseSidebar, type CourseTab } from '../../components/CourseSidebar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import type { Clase, Usuario } from '../../types';

interface Recurso { id: number; titulo: string; descripcion?: string; tipo: string; archivoUrl?: string; enlaceUrl?: string }
interface Modulo { id: number; numeroSemana: number; titulo?: string; descripcion?: string; recursos: Recurso[] }
interface Personas { profesores: Usuario[]; alumnos: Usuario[] }

const sections = ['TEORIA', 'PRACTICA', 'LABORATORIO', 'MATERIAL', 'ENLACE', 'VIDEO'];

export function AlumnoCursoDetalle() {
  const { id } = useParams();
  const [tab, setTab] = useState<CourseTab>('inicio');
  const [clase, setClase] = useState<Clase | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [examenes, setExamenes] = useState<any[]>([]);
  const [streaming, setStreaming] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [personas, setPersonas] = useState<Personas>({ profesores: [], alumnos: [] });
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/alumno/clases'),
      api.get(`/alumno/clases/${id}/modulos`),
      api.get(`/alumno/clases/${id}/tareas`),
      api.get(`/alumno/clases/${id}/examenes`),
      api.get(`/alumno/clases/${id}/streaming`),
      api.get(`/alumno/clases/${id}/personas`),
      api.get('/alumno/notas')
    ]).then(([clases, mods, tasks, exams, streams, people, grades]) => {
      setClase((clases.data as Clase[]).find(c => String(c.id) === id) ?? null);
      setModulos(mods.data);
      setTareas(tasks.data);
      setExamenes(exams.data);
      setStreaming(streams.data);
      setPersonas(people.data);
      setNotas(grades.data);
      setOpen(Object.fromEntries((mods.data as Modulo[]).map(m => [m.id, true])));
    }).finally(() => setLoading(false));
  }, [id]);

  const files = useMemo(() => modulos.flatMap(m => m.recursos), [modulos]);
  if (loading) return <Loading />;

  return (
    <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <CourseSidebar activeTab={tab} onTabChange={setTab} backTo="/alumno/clases" backLabel="Volver a mis clases" />
      <main className="space-y-4">
        <Header clase={clase} alumnos={personas.alumnos.length} />
        {tab === 'inicio' && <Inicio clase={clase} alumnos={personas.alumnos.length} tareas={tareas} examenes={examenes} streaming={streaming} files={files} setTab={setTab} />}
        {tab === 'modulos' && <Modulos modulos={modulos} open={open} setOpen={setOpen} />}
        {tab === 'personas' && <PersonasView personas={personas} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />}
        {tab === 'tareas' && <TareasView tareas={tareas} notas={notas} />}
        {tab === 'evaluaciones' && <EvaluacionesView examenes={examenes} />}
        {tab === 'streaming' && <StreamingView items={streaming} />}
        {tab === 'archivos' && <ArchivosView files={files} />}
        {tab === 'calificaciones' && <CalificacionesView notas={notas} />}
      </main>
    </section>
  );
}

function Header({ clase, alumnos }: { clase: Clase | null; alumnos: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5"><h1 className="text-2xl font-semibold">{clase?.nombre ?? 'Curso'}</h1><p className="text-sm text-slate-500">{clase?.curso?.nombre} · Profesor: {clase?.profesor?.nombres} {clase?.profesor?.apellidos} · {alumnos} alumnos</p></div>;
}

function Inicio({ clase, alumnos, tareas, examenes, streaming, files, setTab }: any) {
  const nextTask = tareas.find((t: any) => !isPast(t.fechaEntrega));
  const nextExam = examenes.find((e: any) => !isPast(e.fechaFin));
  const nextLive = streaming.find((s: any) => s.estado !== 'FINALIZADA');
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><Metric label="Alumnos" value={alumnos} /><Metric label="Tareas" value={tareas.length} /><Metric label="Evaluaciones" value={examenes.length} /></div><div className="grid gap-4 lg:grid-cols-2"><Panel title="Proximos eventos" items={[nextLive?.titulo && `Clase en vivo: ${nextLive.titulo}`, nextTask?.titulo && `Tarea: ${nextTask.titulo}`, nextExam?.titulo && `Evaluacion: ${nextExam.titulo}`].filter(Boolean)} /><Panel title="Ultimos materiales" items={files.slice(-5).map((f: any) => f.titulo)} /></div><div className="flex flex-wrap gap-2"><Quick onClick={() => setTab('modulos')}>Continuar aprendiendo</Quick><Quick onClick={() => setTab('tareas')}>Ver tareas pendientes</Quick><Quick onClick={() => setTab('evaluaciones')}>Ver evaluaciones disponibles</Quick></div></div>;
}

function Modulos({ modulos, open, setOpen }: { modulos: Modulo[]; open: Record<number, boolean>; setOpen: (v: Record<number, boolean>) => void }) {
  if (modulos.length === 0) return <EmptyState title="Sin modulos publicados" message="Aun no hay semanas visibles para este curso." />;
  return <div className="space-y-4">{modulos.map(m => <div key={m.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white"><button className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left" onClick={() => setOpen({ ...open, [m.id]: !open[m.id] })}><span className="font-semibold">Semana {m.numeroSemana}{m.titulo ? ` - ${m.titulo}` : ''}</span><ChevronDown size={18} /></button>{open[m.id] && <div className="space-y-5 p-4">{sections.map(section => <ResourceSection key={section} title={section} recursos={m.recursos.filter(r => r.tipo === section)} />)}</div>}</div>)}</div>;
}

function ResourceSection({ title, recursos }: { title: string; recursos: Recurso[] }) {
  return <div><h3 className="mb-2 text-sm font-semibold text-blue-950">{title}</h3>{recursos.length === 0 ? <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">No hay materiales publicados para esta seccion.</p> : <div className="space-y-2">{recursos.map(r => <FileRow key={r.id} title={r.titulo} url={r.archivoUrl} enlace={r.enlaceUrl} />)}</div>}</div>;
}

function PersonasView({ personas, query, setQuery, filter, setFilter }: any) {
  const groups = [{ title: 'PROFESORES', items: personas.profesores }, { title: 'ALUMNOS', items: personas.alumnos }];
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><input placeholder="Buscar por nombre o email" value={query} onChange={e => setQuery(e.target.value)} /><select value={filter} onChange={e => setFilter(e.target.value)}><option value="TODOS">Todos</option><option value="PROFESOR">Profesores</option><option value="ALUMNO">Alumnos</option></select></div>{groups.filter(g => filter === 'TODOS' || g.title.startsWith(filter)).map(g => <div key={g.title} className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 text-sm font-semibold text-slate-500">{g.title}</h2><div className="grid gap-2 md:grid-cols-2">{g.items.filter((p: Usuario) => `${p.nombres} ${p.apellidos} ${p.email}`.toLowerCase().includes(query.toLowerCase())).map((p: Usuario) => <Person key={p.id} p={p} />)}</div></div>)}</div>;
}

function TareasView({ tareas, notas }: any) {
  const [tab, setTab] = useState('TODAS');
  const entregaFor = (t: any) => notas.find((n: any) => n.tarea?.id === t.id);
  const filtered = tareas.filter((t: any) => tab === 'TODAS' || estadoTarea(t, entregaFor(t)).toUpperCase() === tab);
  return <div className="space-y-3"><Tabs items={['PENDIENTE', 'ENTREGADO', 'REVISADO', 'TODAS']} active={tab} setActive={setTab} />{filtered.map((t: any) => { const e = entregaFor(t); return <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{t.titulo}</h3><p className="text-sm text-slate-600">{t.descripcion}</p><p className="text-sm text-slate-500">Fecha limite: {fmt(t.fechaEntrega)} · Puntaje: -</p></div><Badge>{estadoTarea(t, e)}</Badge></div>{t.archivoUrl && <FileRow title="Archivo de la tarea" url={t.archivoUrl} />}{e && <p className="mt-2 text-sm text-slate-600">Entrega: {e.comentario} · Nota: {e.nota ?? 'Pendiente'}</p>}<Link className="mt-3 inline-block rounded-md bg-blue-700 px-3 py-2 text-sm text-white" to={`/alumno/clases/${t.clase?.id ?? ''}/tareas`}>{e ? 'Ver entrega' : 'Entregar tarea'}</Link></div>; })}</div>;
}

function EvaluacionesView({ examenes }: any) {
  const [tab, setTab] = useState('TODAS');
  const filtered = examenes.filter((e: any) => tab === 'TODAS' || estadoExamen(e).toUpperCase() === tab);
  return <div className="space-y-3"><Tabs items={['DISPONIBLE', 'CERRADA', 'PROXIMAMENTE', 'TODAS']} active={tab} setActive={setTab} />{filtered.map((e: any) => <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{e.titulo}</h3><p className="text-sm text-slate-600">{e.descripcion}</p><p className="text-sm text-slate-500">{fmt(e.fechaInicio)} - {fmt(e.fechaFin)} · Puntaje total: -</p></div><Badge>{estadoExamen(e)}</Badge></div><Link className="mt-3 inline-block rounded-md bg-blue-700 px-3 py-2 text-sm text-white" to={`/alumno/clases/${e.clase?.id ?? ''}/examenes`}>Rendir evaluacion</Link></div>)}</div>;
}

function StreamingView({ items }: any) {
  const [tab, setTab] = useState('TODAS');
  const filtered = items.filter((s: any) => tab === 'TODAS' || s.estado === tab);
  return <div className="space-y-3"><Tabs items={['PROGRAMADA', 'EN_VIVO', 'FINALIZADA', 'TODAS']} active={tab} setActive={setTab} />{filtered.map((s: any) => <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{s.titulo}</h3><p className="text-sm text-slate-600">{s.descripcion}</p><p className="text-sm text-slate-500">{fmt(s.fechaInicio)}</p></div><Badge>{s.estado}</Badge></div><a className="mt-3 inline-block rounded-md bg-green-600 px-3 py-2 text-sm text-white" href={s.enlaceStreaming} target="_blank">Ingresar a clase</a></div>)}</div>;
}

function ArchivosView({ files }: { files: Recurso[] }) {
  return <div className="space-y-3">{files.length === 0 ? <EmptyState title="Sin archivos" /> : files.map(f => <FileRow key={f.id} title={`${f.tipo} · ${f.titulo}`} url={f.archivoUrl} enlace={f.enlaceUrl} />)}</div>;
}

function CalificacionesView({ notas }: any) {
  const graded = notas.filter((n: any) => n.nota != null);
  return graded.length === 0 ? <EmptyState title="Sin calificaciones" /> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Actividad</th><th>Tipo</th><th>Nota</th><th>Comentario</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{graded.map((n: any) => <tr key={n.id} className="border-t"><td className="p-3">{n.tarea?.titulo}</td><td>Tarea</td><td>{n.nota}</td><td>{n.comentario}</td><td>{n.estado}</td><td>{fmt(n.entregadoEn)}</td></tr>)}</tbody></table></div>;
}

function FileRow({ title, url, enlace }: { title: string; url?: string; enlace?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"><div className="flex items-center gap-2"><FileText size={16} className="text-blue-700" /><span>{title}</span></div><div className="flex gap-3">{url && <><Link className="text-blue-700" to={`/viewer/pdf?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>Ver</Link><a className="text-blue-700" href={url} download>Descargar</a></>}{enlace && <a className="text-blue-700" href={enlace} target="_blank">Abrir enlace</a>}</div></div>;
}

function Person({ p }: { p: Usuario }) {
  const initials = `${p.nombres?.[0] ?? ''}${p.apellidos?.[0] ?? ''}`.toUpperCase();
  return <div className="flex items-center gap-3 rounded-md border border-slate-200 p-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-950 text-sm font-semibold text-white">{initials}</div><div><div className="font-medium">{p.nombres} {p.apellidos}</div><div className="text-sm text-slate-500">{p.email}</div><div className="text-xs text-slate-500">{p.rol} · {p.estado ? 'Activo' : 'Inactivo'}</div></div></div>;
}

function Tabs({ items, active, setActive }: { items: string[]; active: string; setActive: (v: string) => void }) {
  return <div className="flex flex-wrap gap-2">{items.map(i => <button key={i} className={`rounded-md px-3 py-2 text-sm ${active === i ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'}`} onClick={() => setActive(i)}>{i}</button>)}</div>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><div className="text-sm text-slate-500">{label}</div><div className="text-2xl font-semibold">{value}</div></div>; }
function Panel({ title, items }: { title: string; items: any[] }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 font-semibold">{title}</h2>{items.length ? items.map((i, idx) => <div key={idx} className="rounded-md bg-slate-50 px-3 py-2 text-sm">{i}</div>) : <p className="text-sm text-slate-500">Sin informacion.</p>}</div>; }
function Quick({ children, onClick }: any) { return <button className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white" onClick={onClick}>{children}</button>; }
function Badge({ children }: any) { return <span className="h-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{children}</span>; }
function fmt(value?: string) { return value ? new Date(value).toLocaleString() : '-'; }
function isPast(value?: string) { return value ? new Date(value).getTime() < Date.now() : false; }
function estadoTarea(t: any, entrega: any) { if (entrega?.nota != null) return 'Revisado'; if (entrega) return isPast(t.fechaEntrega) ? 'Entregado tarde' : 'Entregado'; return isPast(t.fechaEntrega) ? 'Vencido' : 'Pendiente'; }
function estadoExamen(e: any) { const now = Date.now(); if (e.fechaInicio && new Date(e.fechaInicio).getTime() > now) return 'Proximamente'; if (e.fechaFin && new Date(e.fechaFin).getTime() < now) return 'Cerrada'; return 'Disponible'; }
