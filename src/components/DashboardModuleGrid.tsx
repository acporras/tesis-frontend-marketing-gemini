import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Module {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
}

interface DashboardModuleGridProps {
  modules: Module[];
}

export function DashboardModuleGrid({ modules }: DashboardModuleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {modules.map((modulo) => (
        <Link
          key={modulo.title}
          to={modulo.path}
          className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 w-full h-1 ${modulo.color.replace('bg-', 'bg-gradient-to-r from-')} to-${modulo.color.split('-')[1]}-600`} />
          
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-24 h-24 ${modulo.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />

          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${modulo.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
              <modulo.icon
                className={`h-6 w-6 ${modulo.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-300`}
              />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {modulo.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {modulo.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
