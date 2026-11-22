import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  /** Couleur de la pastille d'icône (classes Tailwind texte + fond). */
  iconClassName?: string;
  /** Élément affiché à droite du titre (bouton, sélecteur…). */
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/** Bloc de contenu standard : titre lisible, sous-titre facultatif, contenu. */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconClassName = 'bg-emerald-500/10 text-emerald-400',
  action,
  className = '',
  children
}) => (
  <section className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 ${className}`}>
    {(title || action) && (
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          {title && (
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {Icon && (
                <span className={`p-1.5 rounded-lg shrink-0 ${iconClassName}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
              )}
              <span>{title}</span>
            </h2>
          )}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </section>
);
