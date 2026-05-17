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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((modulo) => (
        <Link
          key={modulo.title}
          to={modulo.path}
          className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full ${modulo.color}`} />

          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${modulo.color} bg-opacity-10`}>
              <modulo.icon
                className={`h-6 w-6 ${modulo.color.replace(
                  'bg-',
                  'text-'
                )}`}
              />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
              {modulo.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {modulo.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
