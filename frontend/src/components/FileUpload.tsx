import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../api/axios';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';

const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4'];
const maxBytes = 10 * 1024 * 1024;

export function FileUpload({ folder, value, onUploaded }: { folder: 'sesiones' | 'tareas' | 'entregas' | 'recursos'; value?: string; onUploaded: (url: string, path: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function upload(file: File) {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowed.includes(ext)) {
      setError('Tipo de archivo no permitido');
      toast.push('Tipo de archivo no permitido', 'error');
      return;
    }
    if (file.size > maxBytes) {
      setError('Archivo demasiado grande');
      toast.push('Archivo demasiado grande', 'error');
      return;
    }
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    setUploading(true);
    try {
      const { data } = await api.post('/files/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFileName(file.name);
      onUploaded(data.url, data.path);
      toast.push('Archivo subido correctamente');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Error al subir archivo';
      setError(msg);
      toast.push(msg, 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <input ref={inputRef} className="hidden" type="file" onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); }} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload size={16} className="mr-2 inline" /> {uploading ? 'Subiendo...' : value ? 'Cambiar archivo' : 'Subir archivo'}
        </Button>
        <span className="text-sm text-slate-600">{fileName || (value ? 'Archivo cargado' : 'Ningun archivo seleccionado')}</span>
      </div>
      {value && <div className="mt-2 flex gap-3 text-sm"><a className="text-blue-700" href={value} target="_blank">Ver archivo</a><a className="text-blue-700" href={value} download>Descargar archivo</a></div>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
