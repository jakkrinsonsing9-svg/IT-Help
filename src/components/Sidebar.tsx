import React from 'react';
import { ActiveView, UserProfile, AppTheme } from '../types';

interface SidebarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  currentUser: UserProfile;
  theme: AppTheme;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  theme,
  isOpenMobile,
  onCloseMobile,
  onOpenAuth,
}) => {
  const isNeu = theme === 'neumorphic';

  const navItemsGeneral: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'แผงควบคุม', icon: 'grid_view' },
    { id: 'new-ticket', label: 'แจ้งซ่อมใหม่', icon: 'add_circle' },
    { id: 'my-tickets', label: 'ใบแจ้งซ่อมของฉัน', icon: 'receipt_long' },
  ];

  const navItemsAdmin: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'all-tickets', label: 'จัดการงานทั้งหมด', icon: 'inbox' },
    { id: 'users', label: 'ช่างและผู้ใช้งาน', icon: 'manage_accounts' },
    { id: 'profile', label: 'โปรไฟล์', icon: 'account_circle' },
  ];

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const asideClasses = isNeu
    ? 'bg-[#e9eff7] border-r border-white/60 shadow-[5px_0_15px_rgba(166,180,200,0.25)]'
    : 'bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)]';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${asideClasses}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center p-1 cursor-pointer ${
                  isNeu ? 'neu-button' : 'bg-blue-50 border border-blue-100'
                }`}
                onClick={() => handleNavClick('dashboard')}
              >
                <img
                  alt="IT Helpdesk Logo"
                  className="h-6 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XPQvTye1g50Wu75t6Mu22-G3yihgx7yz2hTJww3tDY13XHGVwozOMkTIypMxcVJQtwwqjasIzYBhEoTPnExRTuoNrykynhe4ZtQyCAaqmh-zFWU38dfoTpZ5rRTuSf_2MA5rRIet2dji8Tar8pZQnnTsBZtrcLCaSdOL4HxTqg0CWTO8tHj7V1QIsso6upjW11wl8U5gtPV1wlOqfwCZanYp854g-2Dt1OlZr5ZAxwac6_WK-4j6iR"
                />
              </div>
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => handleNavClick('dashboard')}
              >
                <span className="font-headline text-[17px] font-bold text-[#143ee4] tracking-tight leading-none">
                  IT Helpdesk
                </span>
                <span className="text-[11px] text-slate-500 leading-none mt-1 font-medium">
                  ระบบแจ้งซ่อมและบริการ IT
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Status Ribbon */}
          <div className="px-4 py-2">
            <div
              className={`px-3 py-2 rounded-xl flex items-center justify-between ${
                isNeu
                  ? 'neu-inset'
                  : 'bg-slate-50 border border-slate-200/60'
              }`}
            >
              <span className="text-xs text-slate-500 font-medium">
                สถานะผู้ใช้
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isNeu
                    ? 'neu-flat text-[#143ee4] bg-[#e9eff7]'
                    : 'bg-blue-100/70 text-[#006591]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {currentUser.role === 'admin' ? 'เจ้าหน้าที่ไอที' : 'ผู้ใช้งานทั่วไป'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ทั่วไป / General
            </div>
            {navItemsGeneral.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    active
                      ? isNeu
                        ? 'neu-pressed font-bold text-[#143ee4]'
                        : 'bg-[#143ee4] text-white font-semibold shadow-sm'
                      : isNeu
                      ? 'text-slate-600 hover:text-[#143ee4] neu-button mb-1'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      active ? (isNeu ? 'text-[#143ee4]' : 'text-white') : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              การจัดการ / Administration
            </div>
            {navItemsAdmin.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    active
                      ? isNeu
                        ? 'neu-pressed font-bold text-[#143ee4]'
                        : 'bg-[#143ee4] text-white font-semibold shadow-sm'
                      : isNeu
                      ? 'text-slate-600 hover:text-[#143ee4] neu-button mb-1'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      active ? (isNeu ? 'text-[#143ee4]' : 'text-white') : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile Snapshot */}
        <div className="p-3.5 border-t border-slate-200/80">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
              isNeu ? 'neu-card' : 'hover:bg-slate-50'
            }`}
          >
            <img
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
              src={currentUser.avatar}
            />
            <div
              className="flex flex-col min-w-0 flex-1 cursor-pointer"
              onClick={() => handleNavClick('profile')}
            >
              <span className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {currentUser.email}
              </span>
            </div>
            <button
              onClick={onOpenAuth}
              title="สลับบัญชี / เข้าสู่ระบบ"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors ${
                isNeu ? 'neu-button' : 'hover:bg-red-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
