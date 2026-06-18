import { Link, useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';

export function PdfViewerPage() {
  const [params] = useSearchParams();
  const title = params.get('title') ?? 'Archivo';
  const url = params.get('url') ?? '';
  const isPdf = url.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <Link to={-1 as any} className="text-sm text-blue-700">Volver</Link>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>
          {url && <a className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white" href={url} download><Download size={16} className="mr-2" /> Descargar archivo</a>}
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        {!url && <div className="rounded-lg bg-white p-6 text-sm text-slate-500">No se recibio URL de archivo.</div>}
        {url && isPdf && <iframe title={title} src={url} className="h-[80vh] w-full rounded-lg border border-slate-200 bg-white" />}
        {url && !isPdf && <div className="rounded-lg bg-white p-6 text-sm text-slate-600">Este archivo no puede previsualizarse. Descargalo para verlo.</div>}
      </main>
    </div>
  );
}
