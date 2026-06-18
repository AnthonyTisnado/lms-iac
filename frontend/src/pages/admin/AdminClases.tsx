import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import type { Clase, Curso, Usuario } from '../../types';

type ClaseRow = Clase & { totalAlumnos?: number };
const emptyForm = { nombre: '', cursoId: '', profesorId: '', estado: true };

export function AdminClases() {
  const [clases, setClases] = useState<ClaseRow[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<ClaseRow | null>(null);
  const [confirm, setConfirm] = useState<ClaseRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [alumnosModal, setAlumnosModal] = useState<ClaseRow | null>(null);
  const [matriculados, setMatriculados] = useState<Usuario[]>([]);
  const [disponibles, setDisponibles] = useState<Usuario[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const profesores = usuarios.filter(u => u.rol === 'PROFESOR' && u.estado);
  const filtered = useMemo(() => clases.filter(c => `${c.nombre} ${c.curso?.nombre} ${c.profesor?.nombres}`.toLowerCase().includes(query.toLowerCase())), [clases, query]);

  const load = async () => {
    setLoading(true);
    const [cl, cu, us] = await Promise.all([api.get('/admin/clases'), api.get('/admin/cursos'), api.get('/admin/usuarios')]);
    const withCounts = await Promise.all((cl.data as Clase[]).map(async c => {
      const { data } = await api.get(`/admin/clases/${c.id}/alumnos`);
      return { ...c, totalAlumnos: data.length };
    }));
    setClases(withCounts);
    setCursos(cu.data);
    setUsuarios(us.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(clase: ClaseRow) {
    setEditing(clase);
    setForm({ nombre: clase.nombre, cursoId: String(clase.curso.id), profesorId: String(clase.profesor.id), estado: clase.estado });
    setModalOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { nombre: form.nombre, cursoId: Number(form.cursoId), profesorId: Number(form.profesorId), estado: form.estado };
      if (editing) await api.put(`/admin/clases/${editing.id}`, body);
      else await api.post('/admin/clases', body);
      toast.push(editing ? 'Registro actualizado correctamente' : 'Registro creado correctamente');
      setModalOpen(false);
      await load();
    } catch (error: any) {
      toast.push(error.response?.data?.error ?? 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggle() {
    if (!confirm) return;
    await api.patch(`/admin/clases/${confirm.id}/estado`, { estado: !confirm.estado });
    toast.push('Registro actualizado correctamente');
    setConfirm(null);
    load();
  }

  async function openAlumnos(clase: ClaseRow) {
    setAlumnosModal(clase);
    const [m, d] = await Promise.all([api.get(`/admin/clases/${clase.id}/alumnos`), api.get(`/admin/alumnos-disponibles/${clase.id}`)]);
    setMatriculados(m.data);
    setDisponibles(d.data);
  }

  async function addAlumno(alumnoId: number) {
    if (!alumnosModal) return;
    await api.post(`/admin/clases/${alumnosModal.id}/alumnos/${alumnoId}`);
    toast.push('Registro creado correctamente');
    openAlumnos(alumnosModal);
    load();
  }

  async function removeAlumno(alumnoId: number) {
    if (!alumnosModal) return;
    await api.delete(`/admin/clases/${alumnosModal.id}/alumnos/${alumnoId}`);
    toast.push('Registro eliminado correctamente');
    openAlumnos(alumnosModal);
    load();
  }

  if (loading) return <Loading />;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Clases</h1><p className="text-sm text-slate-500">Asigna cursos, profesores y matriculas.</p></div>
        <Button onClick={openCreate}>Crear clase</Button>
      </div>
      <Card><input placeholder="Buscar por clase, curso o profesor" value={query} onChange={e => setQuery(e.target.value)} /></Card>
      {filtered.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Clase</th><th>Curso</th><th>Profesor</th><th>Alumnos</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>{filtered.map(c => <tr className="border-t border-slate-100" key={c.id}><td className="p-3 font-medium">{c.nombre}</td><td>{c.curso?.nombre}</td><td>{c.profesor?.nombres} {c.profesor?.apellidos}</td><td>{c.totalAlumnos ?? 0}</td><td><span className={`rounded-full px-2 py-1 text-xs ${c.estado ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.estado ? 'Activa' : 'Inactiva'}</span></td><td className="space-x-2 p-3 text-right"><Button variant="secondary" onClick={() => openAlumnos(c)}>Gestionar alumnos</Button><Button variant="secondary" onClick={() => openEdit(c)}>Editar</Button><Button variant={c.estado ? 'danger' : 'success'} onClick={() => setConfirm(c)}>{c.estado ? 'Desactivar' : 'Activar'}</Button></td></tr>)}</tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} title={editing ? 'Editar clase' : 'Crear clase'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Nombre de clase" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          <select value={form.cursoId} onChange={e => setForm({ ...form, cursoId: e.target.value })} required><option value="">Curso</option>{cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
          <select value={form.profesorId} onChange={e => setForm({ ...form, profesorId: e.target.value })} required><option value="">Profesor</option>{profesores.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}</select>
          <label className="flex items-center gap-2 text-sm"><input className="h-4 w-4" type="checkbox" checked={form.estado} onChange={e => setForm({ ...form, estado: e.target.checked })} /> Clase activa</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></div>
        </form>
      </Modal>
      <Modal open={!!alumnosModal} title={`Alumnos de ${alumnosModal?.nombre ?? ''}`} onClose={() => setAlumnosModal(null)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div><h3 className="mb-2 font-semibold">Matriculados</h3><div className="space-y-2">{matriculados.length === 0 && <p className="text-sm text-slate-500">Sin alumnos.</p>}{matriculados.map(a => <div key={a.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm"><span>{a.nombres} {a.apellidos}</span><Button variant="danger" onClick={() => removeAlumno(a.id)}>Quitar</Button></div>)}</div></div>
          <div><h3 className="mb-2 font-semibold">Disponibles</h3><div className="space-y-2">{disponibles.length === 0 && <p className="text-sm text-slate-500">No hay alumnos disponibles.</p>}{disponibles.map(a => <div key={a.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm"><span>{a.nombres} {a.apellidos}</span><Button variant="success" onClick={() => addAlumno(a.id)}>Agregar</Button></div>)}</div></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirm} title={confirm?.estado ? 'Desactivar clase' : 'Activar clase'} message="Confirma que deseas cambiar el estado de esta clase." confirmText={confirm?.estado ? 'Desactivar' : 'Activar'} onClose={() => setConfirm(null)} onConfirm={toggle} />
    </section>
  );
}
