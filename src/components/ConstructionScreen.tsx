import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { Construction, ArrowRight, ArrowLeft } from 'lucide-react';

interface QuickLink {
  label: string;
  to: string;
  variant?: 'primary' | 'secondary';
}

interface ConstructionScreenProps {
  screenCode: string;
  title: string;
  description?: string;
  nextLinks?: QuickLink[];
  backFallback?: string;
  children?: React.ReactNode;
}

export const ConstructionScreen: React.FC<ConstructionScreenProps> = ({
  screenCode,
  title,
  description,
  nextLinks,
  backFallback = '/',
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      <TopBar title={title} showBack={true} backFallback={backFallback} />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {/* Screen Code Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-100/80 text-[#1f5c8b] text-xs font-bold mb-4 tracking-wider">
            <span>PANTALLA {screenCode}</span>
          </div>

          {/* Construction Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#fff4cc] border border-[#e0b400] flex items-center justify-center text-[#b26a00] mb-4 shadow-sm">
            <Construction className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {title}
          </h2>

          <div className="inline-block bg-amber-50 text-[#b26a00] border border-amber-200 px-4 py-1.5 rounded-lg text-sm font-semibold mb-3">
            En construcción
          </div>

          {description && (
            <p className="text-sm text-slate-600 max-w-xs mt-2 leading-relaxed">
              {description}
            </p>
          )}

          {children && (
            <div className="w-full mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Quick Flow Navigation Links for Usability Testing */}
        <div className="space-y-3 pb-4">
          {nextLinks && nextLinks.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                Flujo del prototipo
              </p>
              {nextLinks.map((link) => (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => navigate(link.to)}
                  className={`w-full touch-target px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform ${
                    link.variant === 'secondary'
                      ? 'bg-white text-slate-700 border border-slate-300'
                      : 'bg-[#1f5c8b] text-white hover:bg-[#184a70]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate(backFallback)}
            className="w-full touch-target px-4 py-3 rounded-xl font-medium text-sm text-slate-600 bg-white border border-slate-200 flex items-center justify-center gap-2 active:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Inicio</span>
          </button>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};
