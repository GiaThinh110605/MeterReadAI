import React from 'react';
import { Layout, Maximize2, Minimize2 } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  onSwitchPage?: (page: 'login' | 'register') => void;
  currentPage?: 'login' | 'register';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  children,
  onSwitchPage,
  currentPage,
}) => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative selection:bg-sky-500 selection:text-white">
      <header className="h-12 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-400">
            <Layout className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium tracking-wide text-slate-200">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchPage && (
            <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 flex text-xs">
              <button
                type="button"
                onClick={() => onSwitchPage('login')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  currentPage === 'login'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onSwitchPage('register')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  currentPage === 'register'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isFullScreen ? 'Thu nhỏ khung' : 'Toàn màn hình'}
            aria-label="Toggle full screen"
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col items-center justify-center relative p-3 sm:p-6 transition-all duration-300 ${
          isFullScreen ? 'p-0' : ''
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className={`w-full max-w-[1240px] bg-white text-slate-800 flex flex-col justify-between shadow-2xl transition-all duration-300 relative ${
            isFullScreen
              ? 'min-h-[calc(100vh-48px)] rounded-none'
              : 'min-h-[calc(100vh-80px)] rounded-2xl border border-slate-700/40 my-auto'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};
