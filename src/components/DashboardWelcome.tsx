interface DashboardWelcomeProps {
  userName: string;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
  const firstName = userName?.split(' ')[0] || 'Usuario';
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 -z-10"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 -z-10"></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-3 text-lg text-blue-100">
          Aquí tienes tu resumen de actividad y próximas acciones.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Sistema operacional</span>
            <span className="text-sm font-semibold text-white">✓</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Última actualización</span>
            <span className="text-sm font-semibold text-white">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
