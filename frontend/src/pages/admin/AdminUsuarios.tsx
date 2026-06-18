import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import type { Rol, Usuario } from '../../types';

interface Role { id: number; nombre: Rol }
type FormState = { nombres: string; apellidos: string; email: string; password: string; rolId: string; estado: boolean };

const emptyForm: FormState = { nombres: '', apellidos: '', email: '', password: '', rolId: '', estado: true };

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [rol, setRol] = useState('TODOS');
  const [estado, setEstado] = useState('TODOS');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const [u, r] = await Promise.all([api.get('/admin/usuarios'), api.get('/admin/roles')]);
    setUsuarios(u.data);
    setRoles(r.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => usuarios.filter(u => {
    const text = `${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (rol === 'TODOS' || u.rol === rol)
      && (estado === 'TODOS' || (estado === 'ACTIVOS' ? u.estado : !u.estado));
  }), [usuarios, query, rol, estado]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(usuario: Usuario) {
    const role = roles.find(r => r.nombre === usuario.rol);
    setEditing(usuario);
    setForm({ nombres: usuario.nombres, apellidos: usuario.apellidos, email: usuario.email, password: '', rolId: String(role?.id ?? ''), estado: usuario.estado });
    setModalOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!editing && form.password.length < 6) {
      toast.push('Password minimo 6 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, rolId: Number(form.rolId), password: form.password || undefined };
      if (editing) await api.put(`/admin/usuarios/${editing.id}`, body);
      else await api.post('/admin/usuarios', body);
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
    try {
      await api.patch(`/admin/usuarios/${confirm.id}/estado`, { estado: !confirm.estado });
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
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-slate-500">Gestiona administradores, profesores y alumnos.</p>
        </div>
        <Button onClick={openCreate}>Crear usuario</Button>
      </div>
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <input placeholder="Buscar por nombre, apellido o email" value={query} onChange={e => setQuery(e.target.value)} />
          <select value={rol} onChange={e => setRol(e.target.value)}>
            <option value="TODOS">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
          </select>
          <select value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>
        </div>
      </Card>
      {filtered.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr><th className="p-3">Nombre completo</th><th>Email</th><th>Rol</th><th>Estado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr className="border-t border-slate-100" key={u.id}>
                  <td className="p-3 font-medium">{u.nombres} {u.apellidos}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td><span className={`rounded-full px-2 py-1 text-xs ${u.estado ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.estado ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="space-x-2 p-3 text-right"><Button variant="secondary" onClick={() => openEdit(u)}>Editar</Button><Button variant={u.estado ? 'danger' : 'success'} onClick={() => setConfirm(u)}>{u.estado ? 'Desactivar' : 'Activar'}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} title={editing ? 'Editar usuario' : 'Crear usuario'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <input placeholder="Nombres" value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} required />
          <input placeholder="Apellidos" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <select value={form.rolId} onChange={e => setForm({ ...form, rolId: e.target.value })} required><option value="">Rol</option>{roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select>
          <input className="md:col-span-2" placeholder={editing ? 'Nuevo password opcional' : 'Password minimo 6 caracteres'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} />
          <label className="flex items-center gap-2 text-sm"><input className="h-4 w-4" type="checkbox" checked={form.estado} onChange={e => setForm({ ...form, estado: e.target.checked })} /> Usuario activo</label>
          <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirm} title={confirm?.estado ? 'Desactivar usuario' : 'Activar usuario'} message="Confirma que deseas cambiar el estado de este usuario." confirmText={confirm?.estado ? 'Desactivar' : 'Activar'} onClose={() => setConfirm(null)} onConfirm={toggle} />
    </section>
  );
}
