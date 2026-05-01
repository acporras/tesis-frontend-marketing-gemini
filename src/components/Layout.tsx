import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Database,
  ChevronDown,
  ChevronRight,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 'Campañas': true, 'Datos': true, 'Reportes': true });

  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['analista', 'coordinador'] },
    { 
      name: 'Campañas', 
      icon: Layers, 
      roles: ['analista', 'coordinador'],
      children: [
        { name: 'Onboarding', path: '/onboarding', roles: ['analista', 'coordinador'] },
        { name: 'Fidelización', path: '/fidelizacion', roles: ['analista', 'coordinador'] },
        { name: 'Reactivación', path: '/reactivacion', roles: ['analista', 'coordinador'] },
        { name: 'Aprobación', path: '/aprobacion', roles: ['coordinador'] },
      ]
    },
    {
      name: 'Datos',
      icon: Database,
      roles: ['analista', 'coordinador'],
      children: [
        { name: 'Datasets', path: '/admin/dataset', roles: ['coordinador'] },
        { name: 'Audiencias', path: '/audiencias', roles: ['analista', 'coordinador'] },
        { name: 'Esquemas', path: '/datos/esquemas', roles: ['analista', 'coordinador'] },
      ]
    },
    {
      name: 'Reportes',
      icon: BarChart3,
      roles: ['coordinador'],
      children: [
        { name: 'Analítica', path: '/metricas', roles: ['coordinador'] },
      ]
    }
  ];

  const filterNav = (items: any[]) => {
    return items.reduce((acc, item) => {
      if (!usuario?.rol || !item.roles.includes(usuario.rol)) return acc;
      
      const newItem = { ...item };
      if (newItem.children) {
        newItem.children = newItem.children.filter((child: any) => child.roles.includes(usuario.rol));
        if (newItem.children.length === 0) return acc;
      }
      acc.push(newItem);
      return acc;
    }, []);
  };

  const filteredNav = filterNav(navItems);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <span className="text-xl font-bold tracking-tight">ADCAMI</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col py-4">
          <nav className="flex-1 px-4 space-y-2">
            {filteredNav.map((item: any) => {
              if (item.children) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                        {item.name}
                      </div>
                      {openGroups[item.name] ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {openGroups[item.name] && (
                      <div className="pl-11 pr-2 space-y-1">
                        {item.children.map((child: any) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'
                              }`
                            }
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
          <div className="flex items-center">
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 focus:outline-none md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors focus:outline-none"
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{usuario?.nombre}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{usuario?.rol}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button 
              onClick={logout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
