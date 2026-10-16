import React, { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0b132b] flex items-center justify-center sm:p-4 md:p-6 font-sans">
      {/* Mobile container: full width on mobile, 430px mockup frame on desktop */}
      <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] bg-white sm:rounded-[44px] shadow-2xl flex flex-col overflow-hidden sm:border-[8px] sm:border-slate-800">
        
        {/* Hardware Notch / Dynamic Island simulation for desktop preview */}
        <div className="hidden sm:flex absolute top-0 left-0 right-0 h-6 z-50 items-center justify-center pointer-events-none">
          <div className="w-28 h-4 bg-slate-800 rounded-b-xl flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/50" />
            <div className="w-2 h-2 rounded-full bg-blue-900/40" />
          </div>
        </div>

        {/* Content area: full flex column, 100dvh, white background */}
        <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden bg-white">
          {children}
        </div>

        {/* Home gesture bar indicator on desktop simulation */}
        <div className="hidden sm:flex absolute bottom-1 left-0 right-0 h-4 items-center justify-center pointer-events-none z-50">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
