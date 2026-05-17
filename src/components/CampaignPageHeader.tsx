import { ReactNode } from 'react';

interface CampaignPageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: string; // 'emerald', 'blue', 'violet', 'amber'
}

const colorClasses = {
  emerald: {
    bg: 'from-emerald-600 to-emerald-700',
    accent: 'emerald',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    bg: 'from-blue-600 to-blue-700',
    accent: 'blue',
    text: 'text-blue-600 dark:text-blue-400',
  },
  violet: {
    bg: 'from-violet-600 to-violet-700',
    accent: 'violet',
    text: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    bg: 'from-amber-600 to-amber-700',
    accent: 'amber',
    text: 'text-amber-600 dark:text-amber-400',
  }
};

export function CampaignPageHeader({
  icon,
  title,
  description,
  accentColor
}: CampaignPageHeaderProps) {
  const colors = colorClasses[accentColor as keyof typeof colorClasses];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-8 shadow-lg`}>
      {/* Decorative blurred elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-lg text-white/90">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
