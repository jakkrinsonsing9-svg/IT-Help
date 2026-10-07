import React, { useState } from 'react';
import { UserProfile, UserRole, AppTheme, ActiveView } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileSidebar: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: () => void;
  onOpenSupabase: () => void;
  isSupabaseConnected: boolean;
  onToggleRole?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenMobileSidebar,
  theme,
  onToggleTheme,
  onNavigate,
  onOpenAuth,
  onOpenSupabase,
  isSupabaseConnected,
  onToggleRole,
  onSwitchRole,
  unreadCount = 3,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isNeu = theme === 'neumorphic';

  return (
    <header
      className={`fixed top-0 left-0 lg:left-64 right-0 h-16 z-40 flex items-center justify-between px-4 sm:px-6 transition-colors border-b ${
        isNeu
          ? 'bg-[#e9eff7]/95 backdrop-blur-md border-white/60 shadow-[0_2px_10px_rgba(166,180,200,0.15)]'
          : 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]'
      }`}
    >
      {/* Left: Mobile hamburger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="เปิดเมนู"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหารหัสใบงาน, ชื่อผู้แจ้ง, อาคาร หรือประเภทอุปกรณ์..."
            className={`w-full h-10 pl-10 pr-3.5 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
              isNeu
                ? 'neu-inset border-0 focus:ring-2 focus:ring-[#143ee4]/30'
                : 'bg-slate-100/90 focus:bg-white border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Campus label, Theme toggle, Notifs, Help, User dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 pl-2">
        {/* Campus indicator */}
        <div
          className={`hidden xl:flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isNeu
              ? 'neu-inset text-slate-600'
              : 'bg-slate-100 text-slate-600 border border-slate-200/50'
          }`}
        >
          <span>{currentUser.campus}</span>
        </div>

        {/* Theme mode toggle */}
        <button
          onClick={onToggleTheme}
          title="สลับสไตล์การแสดงผล (Modern vs Neumorphic)"
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isNeu
              ? 'neu-button text-[#143ee4]'
              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isNeu ? 'clay' : 'palette'}
          </span>
          <span>{isNeu ? 'Neumorphic' : 'Modern'}</span>
        </button>

        {/* Supabase Connection Button */}
        <button
          onClick={onOpenSupabase}
          title="เชื่อมต่อฐานข้อมูล Supabase (IT Help Project)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isSupabaseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          ></span>
          <span className="hidden md:inline">Supabase:</span>
          <span className="font-mono text-[11px]">IT Help Project</span>
        </button>

        {/* Notifications Icon & Popup */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-colors ${
              isNeu
                ? 'neu-button text-slate-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="การแจ้งเตือน"
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-headline font-bold text-sm text-slate-900">
                  การแจ้งเตือนเหตุขัดข้อง ({unreadCount})
                </span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  ทำเครื่องหมายว่าอ่านแล้ว
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2 space-y-1 max-h-72 overflow-y-auto">
                <div
                  className="py-2.5 px-2 hover:bg-blue-50/50 rounded-xl cursor-pointer"
                  onClick={() => {
                    onNavigate('ticket-detail');
                    setShowNotifications(false);
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-red-600">
                    <span>Critical Alert: อาคาร 3 ชั้น 4</span>
                    <span className="text-slate-400 font-normal">2 น. ที่แล้ว</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">
                    #TK-2024-0042: จอฟ้า CRITICAL_PROCESS_DIED กระทบงานปิดงบ
                  </p>
                </div>
                <div
                  className="py-2.5 px-2 hover:bg-blue-50/50 rounded-xl cursor-pointer"
                  onClick={() => {
                    onNavigate('all-tickets');
                    setShowNotifications(false);
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>งานด่วนใหม่: AP WiFi สัญญาณแกว่ง</span>
                    <span className="text-slate-400 font-normal">14 น. ที่แล้ว</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">
                    #TK-2024-0891: อาคารนวัตกรรมดิจิทัล 402 รอจ่ายงาน
                  </p>
                </div>
                <div
                  className="py-2.5 px-2 hover:bg-blue-50/50 rounded-xl cursor-pointer"
                  onClick={() => {
                    onNavigate('dashboard');
                    setShowNotifications(false);
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>งานสำเร็จ: แก้ไขแชร์ไดรฟ์เรียบร้อย</span>
                    <span className="text-slate-400 font-normal">45 น. ที่แล้ว</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">
                    #TK-2024-0865 โดย ช่างธนกร ภัทรเดช
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Hotline Popup */}
        <div className="relative">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-xl transition-colors ${
              isNeu
                ? 'neu-button text-slate-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="ศูนย์ช่วยเหลือและสายด่วน"
          >
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>

          {showHelp && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95">
              <h4 className="font-headline font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-600">
                  contact_support
                </span>
                ติดต่อศูนย์สนับสนุน IT
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900">
                  <span className="font-bold block">สายด่วนเหตุด่วนฉุกเฉิน:</span>
                  <span className="font-mono font-bold text-sm text-[#143ee4]">
                    02-613-3999 ต่อ 999
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>เวลาทำการ:</span>
                  <span className="font-semibold text-slate-900">08:30 - 16:30 น.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>สถานที่:</span>
                  <span className="font-semibold text-slate-900">ชั้น 2 อาคารอำนวยการ</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>อีเมลรับเรื่อง:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    helpdesk@univ.ac.th
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* 3-Role Switcher Pill & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="สลับบทบาทการใช้งาน (แอดมิน / ช่างเทคนิค / ผู้ใช้บริการ)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-2xs ${
              currentUser.role === 'admin'
                ? 'bg-blue-50 hover:bg-blue-100 text-[#143ee4] border-blue-200/90'
                : currentUser.role === 'technician'
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <span>
              {currentUser.role === 'admin' && '🛡️'}
              {currentUser.role === 'technician' && '🛠️'}
              {currentUser.role === 'user' && '👤'}
            </span>
            <span className="hidden sm:inline">
              {currentUser.role === 'admin' && 'แอดมิน (อำนาจสูงสุด)'}
              {currentUser.role === 'technician' && 'ช่างเทคนิคไอที'}
              {currentUser.role === 'user' && 'ผู้ใช้บริการ (User)'}
            </span>
            <span className="material-symbols-outlined text-[16px] opacity-70">
              arrow_drop_down
            </span>
          </button>

          {/* 3-Role Selector Popover */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  สลับบทบาทการใช้งาน (Role Selection)
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  เลือกบทบาทเพื่อทดสอบสิทธิ์และการเข้าถึงแต่ละส่วนของระบบ
                </span>
              </div>

              <div className="space-y-1.5">
                {/* 1. Admin Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole('admin');
                    else if (onToggleRole) onToggleRole();
                    setShowRoleMenu(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-50/80 border-[#143ee4] ring-1 ring-[#143ee4]/30'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">🛡️</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        แอดมินระบบ (Admin)
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-[#143ee4]">
                        อำนาจสูงสุด
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                      จัดการทุกส่วน ลบ/ล้างข้อมูล บังคับมอบหมายงาน และกำหนดสิทธิ์ทุกคน
                    </span>
                  </div>
                </button>

                {/* 2. Technician Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole('technician');
                    else if (onToggleRole) onToggleRole();
                    setShowRoleMenu(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    currentUser.role === 'technician'
                      ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-500/30'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">🛠️</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        ช่างเทคนิค (Technician)
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        ปฏิบัติการ
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                      โต๊ะงานช่าง รับงานจากคลังกลาง (Claim) อัปเดตงานซ่อม และปิดงาน
                    </span>
                  </div>
                </button>

                {/* 3. User Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole('user');
                    else if (onToggleRole) onToggleRole();
                    setShowRoleMenu(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    currentUser.role === 'user'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/30'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">👤</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        ผู้ใช้บริการ (User / Staff)
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        แจ้ง & ติดตาม
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                      แจ้งซ่อมใหม่ ติดตามสถานะงานของตนเอง และส่งข้อความหาช่าง
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
              isNeu ? 'neu-card' : 'hover:bg-slate-100'
            }`}
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-300"
              src={currentUser.avatar}
            />
            <span className="hidden md:inline text-xs font-semibold text-slate-800">
              {currentUser.name}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              expand_more
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {currentUser.email}
                </span>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                  {currentUser.roleLabel}
                </span>
              </div>

              {/* Fast Role Switch Row in Dropdown */}
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">
                  สิทธิ์ปัจจุบัน: {currentUser.role === 'admin' ? '🛡️ แอดมิน (อำนาจสูงสุด)' : currentUser.role === 'technician' ? '🛠️ ช่างเทคนิค' : '👤 ผู้ใช้บริการ'}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('admin');
                      setShowUserMenu(false);
                    }}
                    className={`py-1 rounded text-[10px] font-bold ${
                      currentUser.role === 'admin' ? 'bg-[#143ee4] text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    แอดมิน
                  </button>
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('technician');
                      setShowUserMenu(false);
                    }}
                    className={`py-1 rounded text-[10px] font-bold ${
                      currentUser.role === 'technician' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ช่าง
                  </button>
                  <button
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole('user');
                      setShowUserMenu(false);
                    }}
                    className={`py-1 rounded text-[10px] font-bold ${
                      currentUser.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ผู้ใช้
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  account_circle
                </span>
                โปรไฟล์และสิทธิ์การเข้าถึง
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#143ee4] hover:bg-blue-50 flex items-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[16px] text-[#143ee4]">
                  photo_camera
                </span>
                เปลี่ยนรูปโปรไฟล์
              </button>
              <button
                onClick={() => {
                  onNavigate('new-ticket');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  add_circle
                </span>
                แจ้งซ่อมใหม่
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button
                onClick={() => {
                  onOpenAuth();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                สลับบัญชี / เข้าสู่ระบบ SSO
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
