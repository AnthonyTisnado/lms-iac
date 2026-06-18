import { Award, BookOpen, ClipboardList, FileText, Radio, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export type CourseTab = 'inicio' | 'modulos' | 'streaming' | 'tareas' | 'evaluaciones' | 'calificaciones' | 'archivos' | 'personas';

const items: Array<[CourseTab, string, typeof BookOpen]> = [
  ['inicio', 'Pagina de inicio', BookOpen],
  ['modulos', 'Modulos', FileText],
  ['streaming', 'Clases en vivo', Radio],
  ['tareas', 'Tareas', ClipboardList],
  ['evaluaciones', 'Evaluaciones', Award],
  ['calificaciones', 'Calificaciones', Award],
  ['archivos', 'Archivos', FileText],
  ['personas', 'Personas', Users]
];

export function CourseSidebar({ activeTab, onTabChange, backTo, backLabel }: { activeTab: CourseTab; onTabChange: (tab: CourseTab) => void; backTo: string; backLabel: string }) {
  return (
    <aside className="lg:sticky lg:top-4 lg:h-fit">
      <Link to={backTo} className="mb-3 block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
        {backLabel}
      </Link>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <div className="px-2 py-2 text-xs font-semibold uppercase text-slate-500">Curso</div>
        <nav className="space-y-1">
          {items.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${activeTab === key ? 'bg-blue-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
