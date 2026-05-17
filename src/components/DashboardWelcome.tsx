interface DashboardWelcomeProps {
  userName: string;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
  const firstName = userName?.split(' ')[0] || 'Usuario';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        ¡Hola, {firstName}!
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Bienvenido al sistema ADCAMI. ¿Qué te gustaría gestionar hoy?
      </p>
    </div>
  );
}
