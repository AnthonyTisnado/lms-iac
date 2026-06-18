import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import type { Curso } from '../../types';

const emptyForm = { nombre: '', descripcion: '', estado: true };

export function AdminCursos() {
  const [items, setItems] = useState<Curso[]>([]);
  const [editing, setEditing] = useState<Curso | null>(null);
  const [confirm, setConfirm] = useState<Curso | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/cursos');
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter(c => c.nombre.toLowerCase().includes(query.toLowerCase())), [items, query]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(curso: Curso) {
    setEditing(curso);
    setForm({ nombre: curso.nombre, descripcion: curso.descripcion ?? '', estado: curso.estado });
    setModalOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/cursos/${editing.id}`, form);
      else await api.post('/admin/cursos', form);
      toast.push(editing ? 'Registro actualizado correctamente' : 'Registro creado correctamente');
      setModalOpen(false);
      await load();
    } catch {
      toast.push('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggle() {
    if (!confirm) return;
    try {
      await api.patch(`/admin/cursos/${confirm.id}/estado`, { estado: !confirm.estado });
      toast.push('Registro actualizado correctamente');
      setConfirm(null);
      await load();
    } catch {
      toast.push('Error al guardar', 'error');
    }
  }

  if (loading) return <Loading />;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Cursos</h1><p className="text-sm text-slate-500">Gestiona la oferta academica.</p></div>
        <Button onClick={openCreate}>Crear curso</Button>
      </div>
      <Card><input placeholder="Buscar curso por nombre" value={query} onChange={e => setQuery(e.target.value)} /></Card>
      {filtered.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Nombre</th><th>Descripcion</th><th>Clases</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>{filtered.map(c => <tr className="border-t border-slate-100" key={c.id}><td className="p-3 font-medium">{c.nombre}</td><td className="max-w-md text-slate-600">{c.descripcion}</td><td>{c.totalClases ?? '-'}</td><td><span className={`rounded-full px-2 py-1 text-xs ${c.estado ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{c.estado ? 'Activo' : 'Inactivo'}</span></td><td className="space-x-2 p-3 text-right"><Button variant="secondary" onClick={() => openEdit(c)}>Editar</Button><Button variant={c.estado ? 'danger' : 'success'} onClick={() => setConfirm(c)}>{c.estado ? 'Desactivar' : 'Activar'}</Button></td></tr>)}</tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} title={editing ? 'Editar curso' : 'Crear curso'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          <textarea placeholder="Descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input className="h-4 w-4" type="checkbox" checked={form.estado} onChange={e => setForm({ ...form, estado: e.target.checked })} /> Curso activo</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} title={confirm?.estado ? 'Desactivar curso' : 'Activar curso'} message="Confirma que deseas cambiar el estado de este curso." confirmText={confirm?.estado ? 'Desactivar' : 'Activar'} onClose={() => setConfirm(null)} onConfirm={toggle} />
    </section>
  );
}
