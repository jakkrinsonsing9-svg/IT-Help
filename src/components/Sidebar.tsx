import React from 'react';
import { ActiveView, UserProfile, AppTheme, UserRole } from '../types';

interface SidebarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  currentUser: UserProfile;
  theme: AppTheme;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAuth: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  theme,
  isOpenMobile,
  onCloseMobile,
  onOpenAuth,
  onSwitchRole,
}) => {
  const isNeu = theme === 'neumorphic';

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const asideClasses = isNeu
    ? 'bg-[#e9eff7] border-r border-white/60 shadow-[5px_0_15px_rgba(166,180,200,0.25)]'
    : 'bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)]';

  // Role-tailored navigation items
  const getNavSections = () => {
    if (currentUser.role === 'admin') {
      return [
        {
          title: 'ศูนย์อำนาจแอดมิน / Super Admin',
          items: [
            { id: 'dashboard' as ActiveView, label: 'แผงควบคุมระบบ', icon: 'grid_view' },
            { id: 'admin-center' as ActiveView, label: '🛡️ ศูนย์อำนาจแอดมิน', icon: 'admin_panel_settings', badge: 'สูงสุด' },
            { id: 'all-tickets' as ActiveView, label: 'จัดการงานทั้งหมด', icon: 'inbox' },
            { id: 'tech-workspace' as ActiveView, label: 'โต๊ะงานช่าง', icon: 'engineering' },
          ],
        },
        {
          title: 'การจัดการ / Operations',
          items: [
            { id: 'new-ticket' as ActiveView, label: 'สร้างใบแจ้งซ่อม', icon: 'add_circle' },
            { id: 'users' as ActiveView, label: 'ช่างและผู้ใช้งาน', icon: 'manage_accounts' },
            { id: 'profile' as ActiveView, label: 'โปรไฟล์ของฉัน', icon: 'account_circle' },
          ],
        },
      ];
    } else if (currentUser.role === 'technician') {
      return [
        {
          title: 'ส่วนช่างเทคนิค / Tech Desk',
          items: [
            { id: 'tech-workspace' as ActiveView, label: '🛠️ โต๊ะงานช่าง', icon: 'engineering', badge: 'คิวงาน' },
            { id: 'my-tickets' as ActiveView, label: 'งานที่รับผิดชอบ', icon: 'receipt_long' },
            { id: 'all-tickets' as ActiveView, label: 'คลังงานกลาง (รอหยิบ)', icon: 'inbox' },
          ],
        },
        {
          title: 'บริการและข้อมูล / Support',
          items: [
            { id: 'dashboard' as ActiveView, label: 'ภาพรวมงานซ่อม', icon: 'analytics' },
            { id: 'users' as ActiveView, label: 'รายชื่อทีมช่าง', icon: 'badge' },
            { id: 'new-ticket' as ActiveView, label: 'เปิดงานแทนผู้ใช้', icon: 'add_circle' },
            { id: 'profile' as ActiveView, label: 'โปรไฟล์ช่าง', icon: 'account_circle' },
          ],
        },
      ];
    } else {
      // User / Requester
      return [
        {
          title: 'บริการผู้ใช้ / User Services',
          items: [
            { id: 'new-ticket' as ActiveView, label: '➕ แจ้งซ่อมใหม่', icon: 'add_circle', highlight: true },
            { id: 'my-tickets' as ActiveView, label: 'ใบแจ้งซ่อมของฉัน', icon: 'receipt_long' },
            { id: 'profile' as ActiveView, label: 'โปรไฟล์ผู้ใช้', icon: 'account_circle' },
          ],
        },
      ];
    }
  };

  const navSections = getNavSections();

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
                onClick={() =>
                  handleNavClick(
                    currentUser.role === 'admin'
                      ? 'dashboard'
                      : currentUser.role === 'technician'
                      ? 'tech-workspace'
                      : 'my-tickets'
                  )
                }
              >
                <img
                  alt="IT Helpdesk Logo"
                  className="h-6 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XPQvTye1g50Wu75t6Mu22-G3yihgx7yz2hTJww3tDY13XHGVwozOMkTIypMxcVJQtwwqjasIzYBhEoTPnExRTuoNrykynhe4ZtQyCAaqmh-zFWU38dfoTpZ5rRTuSf_2MA5rRIet2dji8Tar8pZQnnTsBZtrcLCaSdOL4HxTqg0CWTO8tHj7V1QIsso6upjW11wl8U5gtPV1wlOqfwCZanYp854g-2Dt1OlZr5ZAxwac6_WK-4j6iR"
                />
              </div>
              <div
                className="flex flex-col cursor-pointer"
                onClick={() =>
                  handleNavClick(
                    currentUser.role === 'admin'
                      ? 'dashboard'
                      : currentUser.role === 'technician'
                      ? 'tech-workspace'
                      : 'my-tickets'
                  )
                }
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

          {/* User Role Ribbon Banner */}
          <div className="px-4 py-2">
            <div
              className={`p-2.5 rounded-2xl flex flex-col gap-1.5 ${
                isNeu
                  ? 'neu-inset'
                  : currentUser.role === 'admin'
                  ? 'bg-blue-50/80 border border-blue-200/80'
                  : currentUser.role === 'technician'
                  ? 'bg-amber-50/80 border border-amber-200/80'
                  : 'bg-emerald-50/80 border border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  สิทธิ์การใช้งาน
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  {currentUser.role === 'admin' && '🛡️'}
                  {currentUser.role === 'technician' && '🛠️'}
                  {currentUser.role === 'user' && '👤'}
                </span>
                <span
                  className={`text-xs font-extrabold truncate ${
                    currentUser.role === 'admin'
                      ? 'text-[#143ee4]'
                      : currentUser.role === 'technician'
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}
                >
                  {currentUser.role === 'admin' && 'แอดมิน (อำนาจสูงสุด)'}
                  {currentUser.role === 'technician' && 'ช่างเทคนิคไอที'}
                  {currentUser.role === 'user' && 'ผู้ใช้บริการ (User)'}
                </span>
              </div>

              {/* Fast 3-Role Toggle Mini Pills */}
              {onSwitchRole && (
                <div className="pt-1.5 mt-1 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => onSwitchRole('admin')}
                    title="สลับเป็น แอดมิน (อำนาจสูงสุด)"
                    className={`py-1 rounded font-bold transition-all ${
                      currentUser.role === 'admin'
                        ? 'bg-[#143ee4] text-white shadow-xs'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    แอดมิน
                  </button>
                  <button
                    onClick={() => onSwitchRole('technician')}
                    title="สลับเป็น ช่างเทคนิค"
                    className={`py-1 rounded font-bold transition-all ${
                      currentUser.role === 'technician'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    ช่าง
                  </button>
                  <button
                    onClick={() => onSwitchRole('user')}
                    title="สลับเป็น ผู้ใช้บริการ"
                    className={`py-1 rounded font-bold transition-all ${
                      currentUser.role === 'user'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    ผู้ใช้
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 pt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left ${
                        active
                          ? isNeu
                            ? 'neu-pressed font-bold text-[#143ee4]'
                            : 'bg-[#143ee4] text-white font-semibold shadow-sm'
                          : (item as any).highlight
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200/80 mb-1'
                          : isNeu
                          ? 'text-slate-600 hover:text-[#143ee4] neu-button mb-1'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            active
                              ? isNeu
                                ? 'text-[#143ee4]'
                                : 'text-white'
                              : (item as any).highlight
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {(item as any).badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
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
                {currentUser.roleLabel}
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
