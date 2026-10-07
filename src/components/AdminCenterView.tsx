import React, { useState } from 'react';
import {
  Ticket,
  Technician,
  UserProfile,
  UserRole,
  AppTheme,
  ActiveView,
} from '../types';

interface AdminCenterViewProps {
  tickets: Ticket[];
  technicians: Technician[];
  currentUser: UserProfile;
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onClearAllTickets?: () => void;
  onLoadSampleTickets?: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchRole: (role: UserRole) => void;
  onAddTechnician?: (newTech: Technician) => void;
  onDeleteTechnician?: (techId: string) => void;
  onUpdateTechnician?: (updatedTech: Technician) => void;
  onUpdateTechStatus?: (techId: string, status: 'available' | 'busy' | 'remote') => void;
}

export const AdminCenterView: React.FC<AdminCenterViewProps> = ({
  tickets,
  technicians,
  currentUser,
  theme,
  onNavigate,
  onClearAllTickets,
  onLoadSampleTickets,
  onShowToast,
  onSwitchRole,
  onAddTechnician,
  onDeleteTechnician,
  onUpdateTechnician,
  onUpdateTechStatus,
}) => {
  const isNeu = theme === 'neumorphic';
  const [activeTab, setActiveTab] = useState<'overview' | 'techs' | 'data-control'>('overview');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [securityPhrase, setSecurityPhrase] = useState('');

  // Technician modal states
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null);
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    code: '',
    role: 'ช่างฮาร์ดแวร์ & ประจำจุด',
    department: 'ฝ่ายบริการอุปกรณ์คอมพิวเตอร์และเครือข่าย',
    location: 'หน้างาน: ศูนย์คอมพิวเตอร์',
    phone: '085-555-1234',
    extension: '4420',
    status: 'available' as 'available' | 'busy' | 'remote',
  });

  // Personnel roster - clean start with Super Admin only
  const [userRoster, setUserRoster] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      dept: string;
      role: UserRole;
      title: string;
      lastActive: string;
      canModify: boolean;
    }>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_user_roster');
        if (saved) {
          const parsed = JSON.parse(saved);
          const clean = parsed.filter(
            (u: any) =>
              u.email === 'jakkrinsonsing9@gmail.com' ||
              (![
                'worawit.y@univ.ac.th',
                'kanda.n@univ.ac.th',
                'thanakorn.p@univ.ac.th',
                'kanya.w@org.ac.th',
                'teerapat.c@univ.ac.th',
                'somchai.s@univ.ac.th',
                'tech@example.com',
              ].includes(u.email) &&
                !u.id.startsWith('usr-tech-') &&
                !u.id.startsWith('usr-user-'))
          );
          if (clean.length > 0) return clean;
        }
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'usr-admin-01',
        name: 'จักรินทร์ (Super Admin)',
        email: 'jakkrinsonsing9@gmail.com',
        dept: 'ศูนย์เทคโนโลยีสารสนเทศและผู้ดูแลระบบหลัก',
        role: 'admin' as UserRole,
        title: 'ผู้ดูแลระบบสูงสุด (Super Admin - Security Level 0)',
        lastActive: 'ออนไลน์ขณะนี้ (กำลังใช้งาน)',
        canModify: false,
      },
    ];
  });

  // Persist user roster
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_user_roster', JSON.stringify(userRoster));
      } catch (e) {
        // ignore
      }
    }
  }, [userRoster]);

  // Modal to add new user
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    dept: 'แผนกทั่วไป',
    role: 'user' as UserRole,
    title: 'เจ้าหน้าที่',
  });

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    let targetUser: any = null;
    setUserRoster((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUser = u;
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    // If appointed as technician, check if already in technicians list
    if (newRole === 'technician' && targetUser && onAddTechnician) {
      const exists = technicians.some(
        (t) => t.name.includes(targetUser.name.split(' ')[0]) || t.name === targetUser.name
      );
      if (!exists) {
        const nextNum = technicians.length + 1;
        const padded = nextNum < 10 ? `0${nextNum * 2}` : `${nextNum * 2}`;
        const newTech: Technician = {
          id: 'tech-' + Date.now(),
          name: targetUser.name,
          code: `IT-${padded}`,
          role: 'ช่างเทคนิคประจำจุด',
          department: targetUser.dept || 'ฝ่ายบริการไอที',
          location: 'ประจำจุดบริการ',
          status: 'available',
          activeLoad: 0,
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBxqIBX1Ai2kASVAhVrvt2vcmjkiKFW7JcCxvIvHiIOi5Zhzib5ZDA2ZdJulA8oUdoTDIV9ehKEYdQvCZBVA44389rZnP36Oetlb3D8OL6YDgQwBJoARVku744i1Gm4GruiXKnzn3aArCtQABlimQ08eGucDRMWSn9AMi44It0AAYqCK3APM3qZD6E6vf56NK7RAaTwUyx8yqKtgovN-TppAthd-fEoWdg20HRgXCFGfDidffT4KhI',
          phone: '081-999-' + padded,
          extension: '44' + padded,
        };
        onAddTechnician(newTech);
      }
    }

    const roleLabel =
      newRole === 'admin'
        ? 'แอดมินสูงสุด (Super Admin)'
        : newRole === 'technician'
        ? 'ช่างเทคนิค (Technician)'
        : 'ผู้ใช้บริการ (User)';

    onShowToast('ปรับเปลี่ยนสิทธิ์สำเร็จ', `กำหนดสิทธิ์ให้บัญชีเป็น [${roleLabel}] เรียบร้อย`, 'success');
  };

  const handleCreateTechnicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name.trim()) {
      onShowToast('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อช่าง', 'error');
      return;
    }

    const nextNum = technicians.length + 1;
    const newTech: Technician = {
      id: 'tech-' + Date.now(),
      name: newTechForm.name.trim(),
      code: newTechForm.code.trim() || `IT-0${nextNum}`,
      role: newTechForm.role,
      department: newTechForm.department,
      location: newTechForm.location,
      phone: newTechForm.phone,
      extension: newTechForm.extension,
      status: newTechForm.status,
      activeLoad: 0,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAfP2hFoqefB-ZXmay836sp_LlaLisj-lQcqAgBxFCIbZGWUaVN06HRgYAEhCBdZHBGiiXairDtSQhEiEFhsIJ0Eslqdy3jmP9FldoJbEyGWUV7U2o7dyY-V7BdignbAHcLn3ZvFte-ShZKDBS4ltDnF1K53JHvpYUMTD7_lC88u3iovlrORGf5Bqlc6-7Hbghetn3t0KMaOVa4MZp22oB6peu1ANtjQeUhiG6_WxiWRlFwN9IvrXI',
    };

    if (onAddTechnician) {
      onAddTechnician(newTech);
    }
    setShowAddTechModal(false);
  };

  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            system: 'IT Helpdesk System Backup',
            exportedAt: new Date().toISOString(),
            exportedBy: currentUser.name,
            adminEmail: currentUser.email,
            totalTickets: tickets.length,
            tickets: tickets,
            technicians: technicians,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `it_helpdesk_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('สำรองข้อมูลสำเร็จ', 'ดาวน์โหลดไฟล์ JSON สำรองเรียบร้อยแล้ว', 'success');
  };

  const cardCls = isNeu
    ? 'neu-card p-6'
    : 'bg-white rounded-3xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Banner: Admin Authority Header */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isNeu
            ? 'neu-flat bg-[#e9eff7]'
            : 'bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-4xl text-amber-400">
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                🛡️ ผู้ดูแลระบบระดับสูงสุด (Super Admin: {currentUser.email})
              </span>
              <span className="text-xs text-white/70 font-mono">
                Clearance: Level 0 (Ultimate Control)
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              ศูนย์อำนาจบริหารและควบคุมระบบ (Admin Authority Center)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              บัญชี <b>{currentUser.email}</b> มีอำนาจสูงสุดในการเลือกแต่งตั้งหรือลบใครเป็นช่าง 
              ควบคุมสิทธิ์ผู้ใช้ทุกคน และบริหารจัดการฐานข้อมูลระบบ
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
            <span>สำรองข้อมูล JSON</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>กลับแดชบอร์ดภาพรวม</span>
          </button>
        </div>
      </div>

      {/* Authority Matrix Cards (3 Roles Comparison) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Box 1: Admin Authority */}
        <div
          className={`${cardCls} border-l-4 border-l-[#143ee4] relative overflow-hidden flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-[#143ee4]">
                🛡️ แอดมิน (Admin)
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                อำนาจสูงสุด
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 mt-3">
              ผู้ดูแลและควบคุมระบบ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              เข้าถึงทุกหน้าจอ มีอำนาจเลือกหรือลบช่าง และกำหนดสิทธิ์ทุกคน
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span><b>เลือกและลบช่าง</b> ในระบบได้ทันที (Add & Delete Techs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>ปรับเปลี่ยนสิทธิ์ผู้ใช้ทุกคน (Admin / Tech / User)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>ล้าง/รีเซ็ตข้อมูลทั้งระบบ หรือกู้คืนข้อมูลตัวอย่าง</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-[#143ee4]">บทบาทปัจจุบัน: {currentUser.email}</span>
          </div>
        </div>

        {/* Box 2: Technician Authority */}
        <div
          className={`${cardCls} border-l-4 border-l-amber-500 flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                🛠️ ช่างเทคนิค (Technician)
              </span>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {technicians.length} คนในทีม
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 mt-3">
              ผู้ปฏิบัติการและแก้ไขปัญหา
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              รับมอบหมายงาน เข้าโต๊ะงานช่าง และปรับสถานะงานซ่อม
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>เข้าสู่ "โต๊ะงานช่าง" (Tech Workspace)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>กด "หยิบรับงาน (Claim)" จากคลังกลาง</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-slate-300 shrink-0">
                  block
                </span>
                <span>ไม่มีสิทธิ์ลบหรือแต่งตั้งช่างคนอื่น</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSwitchRole('technician')}
              className="w-full py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              ทดลองสลับเป็นมุมมองช่าง ➔
            </button>
          </div>
        </div>

        {/* Box 3: User Authority */}
        <div
          className={`${cardCls} border-l-4 border-l-emerald-500 flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                👤 ผู้ใช้บริการ (User)
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                แจ้งซ่อม & ติดตาม
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 mt-3">
              บุคลากรและผู้แจ้งปัญหา
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ส่งคำร้องแจ้งปัญหาอุปกรณ์ ติดตามความคืบหน้า และแชทคุยกับช่าง
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>เปิดใบแจ้งซ่อมใหม่ (New Ticket) รวดเร็ว</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                  check_circle
                </span>
                <span>ติดตามใบงานของตนเอง (My Requests Timeline)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-slate-300 shrink-0">
                  block
                </span>
                <span>ซ่อนเครื่องมือแอดมินและข้อมูลที่ไม่เกี่ยวข้อง</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSwitchRole('user')}
              className="w-full py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              ทดลองสลับเป็นมุมมองผู้ใช้บริการ ➔
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#143ee4] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          รายชื่อและสิทธิ์บุคลากร (User Management)
        </button>
        <button
          onClick={() => setActiveTab('techs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'techs'
              ? 'bg-[#143ee4] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">engineering</span>
          <span>จัดการทีมช่าง / เลือกและลบช่าง ({technicians.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('data-control')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data-control'
              ? 'bg-[#143ee4] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ควบคุมฐานข้อมูล & ความปลอดภัย (Database Governance)
        </button>
      </div>

      {/* TAB 1: User Roles Management */}
      {activeTab === 'overview' && (
        <div className={cardCls}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-slate-900">
                การจัดการบทบาทและสิทธิ์ผู้ใช้งาน (Personnel & Role Assignment)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ในฐานะแอดมินสูงสุด คุณสามารถเลือกแต่งตั้งบุคคลเป็นช่าง เลื่อนขั้นเป็นแอดมิน หรือปรับเป็นผู้ใช้ทั่วไปได้ทันที
              </p>
            </div>
            <button
              onClick={() => setActiveTab('techs')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">engineering</span>
              <span>ไปยังแท็บจัดการทีมช่าง</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">ผู้ใช้งาน</th>
                  <th className="py-3 px-4">สังกัด/แผนก</th>
                  <th className="py-3 px-4">บทบาทปัจจุบัน</th>
                  <th className="py-3 px-4">สถานะล่าสุด</th>
                  <th className="py-3 px-4 text-right">สิทธิ์ปรับเปลี่ยนโดยแอดมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userRoster.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{u.dept}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-[#143ee4]'
                            : u.role === 'technician'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'admin' && '🛡️ แอดมินสูงสุด'}
                        {u.role === 'technician' && '🛠️ ช่างเทคนิค'}
                        {u.role === 'user' && '👤 ผู้ใช้บริการ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{u.lastActive}</td>
                    <td className="py-3.5 px-4 text-right">
                      {u.canModify ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleChangeRole(u.id, 'admin')}
                            disabled={u.role === 'admin'}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.role === 'admin'
                                ? 'opacity-30 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            ตั้งเป็น Admin
                          </button>
                          <button
                            onClick={() => handleChangeRole(u.id, 'technician')}
                            disabled={u.role === 'technician'}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.role === 'technician'
                                ? 'opacity-30 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs'
                            }`}
                          >
                            ✓ เลือกเป็นช่าง
                          </button>
                          <button
                            onClick={() => handleChangeRole(u.id, 'user')}
                            disabled={u.role === 'user'}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              u.role === 'user'
                                ? 'opacity-30 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            ตั้งเป็น ผู้ใช้
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-full">
                          🛡️ บัญชีของคุณ ({currentUser.email})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Technicians Roster Management (Add/Delete Techs) */}
      {activeTab === 'techs' && (
        <div className={cardCls}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-lg text-slate-900">
                  บริหารจัดการทีมช่าง (Technician Roster & Operations)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-[#143ee4]">
                  {technicians.length} ท่าน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกแต่งตั้งช่างใหม่ กำหนดรหัสประจำตัว หรือลบช่างที่ไม่ปฏิบัติงานออกจากระบบ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextNum = technicians.length + 1;
                  const padded = nextNum < 10 ? `0${nextNum * 2}` : `${nextNum * 2}`;
                  setNewTechForm({
                    name: '',
                    code: `IT-${padded}`,
                    role: 'ช่างฮาร์ดแวร์ & ประจำจุด',
                    department: 'ฝ่ายบริการอุปกรณ์คอมพิวเตอร์และเครือข่าย',
                    location: 'หน้างาน: ศูนย์คอมพิวเตอร์',
                    phone: '085-123-4567',
                    extension: `44${padded}`,
                    status: 'available',
                  });
                  setShowAddTechModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#143ee4] hover:bg-[#1034bf] text-white inline-flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>+ แต่งตั้งช่างใหม่</span>
              </button>
              <button
                onClick={() => onNavigate('users')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>ดูหน้ารายชื่อทีมช่าง</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">รหัส / ช่าง</th>
                  <th className="py-3 px-4">ความเชี่ยวชาญ & แผนก</th>
                  <th className="py-3 px-4">การติดต่อ</th>
                  <th className="py-3 px-4">สถานะปัจจุบัน</th>
                  <th className="py-3 px-4">งานคงค้าง</th>
                  <th className="py-3 px-4 text-right">การจัดการโดยแอดมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {technicians.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {t.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#143ee4]">{t.role}</div>
                      <div className="text-[11px] text-slate-500">{t.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{t.phone}</div>
                      <div className="text-[11px] text-slate-400">ต่อ {t.extension}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'busy'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status === 'available' && '🟢 พร้อมรับงาน'}
                        {t.status === 'busy' && '🟠 ติดงานซ่อม'}
                        {t.status === 'remote' && '🔵 กำลัง Remote'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        {t.activeLoad} งาน
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            if (onUpdateTechStatus) {
                              const nextStatus =
                                t.status === 'available'
                                  ? 'busy'
                                  : t.status === 'busy'
                                  ? 'remote'
                                  : 'available';
                              onUpdateTechStatus(t.id, nextStatus);
                              onShowToast('เปลี่ยนสถานะ', `ปรับสถานะ ${t.name} เป็น ${nextStatus}`, 'info');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          สลับสถานะ
                        </button>
                        <button
                          onClick={() => setTechToDelete(t)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>ลบช่าง</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Database Governance */}
      {activeTab === 'data-control' && (
        <div className="space-y-6">
          <div className={`${cardCls} border-l-4 border-l-red-500`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  โซนคำสั่งระดับสูง (Critical Data Governance)
                </span>
                <h3 className="font-headline font-bold text-lg text-slate-900 mt-2">
                  การล้างและกู้คืนข้อมูลใบแจ้งซ่อม (System Data Reset & Initialization)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  แอดมินมีอำนาจสูงสุดในการล้างข้อมูลใบงานตัวอย่างทั้งหมด เพื่อให้ระบบสะอาดพร้อมรับงานจริง
                  หรือกดโหลดข้อมูลตัวอย่างกลับมาเพื่อการทดสอบ
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-red-500">
                warning
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowClearConfirmModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>ล้างข้อมูลใบงานทั้งหมด (Clear All Tickets)</span>
              </button>

              {onLoadSampleTickets && (
                <button
                  onClick={() => {
                    onLoadSampleTickets();
                    onShowToast('นำเข้าข้อมูลสำเร็จ', 'โหลดใบแจ้งซ่อมตัวอย่างกลับสู่ระบบแล้ว', 'success');
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>โหลดข้อมูลตัวอย่างเพื่อทดสอบ (Load Samples)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Technician */}
      {showAddTechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#143ee4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-slate-900">
                    แต่งตั้ง / เลือกช่างคนใหม่
                  </h3>
                  <p className="text-xs text-slate-500">
                    เพิ่มรายชื่อเข้าสู่ทีมช่างปฏิบัติการ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTechModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTechnicianSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ชื่อ-นามสกุลช่าง *</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.name}
                    onChange={(e) => setNewTechForm({ ...newTechForm, name: e.target.value })}
                    placeholder="เช่น วรวิทย์ ยิ่งยง"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">รหัสช่าง *</label>
                  <input
                    type="text"
                    required
                    value={newTechForm.code}
                    onChange={(e) => setNewTechForm({ ...newTechForm, code: e.target.value })}
                    placeholder="เช่น IT-04"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ความเชี่ยวชาญ</label>
                <input
                  type="text"
                  value={newTechForm.role}
                  onChange={(e) => setNewTechForm({ ...newTechForm, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สังกัด / แผนก</label>
                  <input
                    type="text"
                    value={newTechForm.department}
                    onChange={(e) => setNewTechForm({ ...newTechForm, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์มือถือ</label>
                  <input
                    type="text"
                    value={newTechForm.phone}
                    onChange={(e) => setNewTechForm({ ...newTechForm, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddTechModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#143ee4] hover:bg-[#1034bf] text-white shadow-md inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>บันทึกแต่งตั้ง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Technician confirmation */}
      {techToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-900 text-center">
              ยืนยันการลบช่างคนนี้?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณกำลังจะลบ <b>{techToDelete.name} ({techToDelete.code})</b> ออกจากระบบทีมช่างปฏิบัติการ
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTechToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTechnician) {
                    onDeleteTechnician(techToDelete.id);
                  }
                  setTechToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>ยืนยันลบช่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear All Tickets */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-900 text-center">
              ยืนยันการล้างข้อมูลใบงานทั้งหมด?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              การดำเนินการนี้จะลบรายการใบแจ้งซ่อมทั้งหมดออกจากระบบและฐานข้อมูล
            </p>

            <div className="mt-4">
              <label className="text-xs text-slate-600 block mb-1 font-bold text-center">
                พิมพ์คำว่า <span className="font-mono text-red-600">DELETE</span> เพื่อยืนยัน
              </label>
              <input
                type="text"
                value={securityPhrase}
                onChange={(e) => setSecurityPhrase(e.target.value)}
                placeholder="DELETE"
                className="w-full h-10 px-3 text-center rounded-xl border border-slate-300 focus:outline-none focus:border-red-500 text-slate-900 font-mono uppercase font-bold text-sm"
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirmModal(false);
                  setSecurityPhrase('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={securityPhrase !== 'DELETE'}
                onClick={() => {
                  if (onClearAllTickets) {
                    onClearAllTickets();
                  }
                  setShowClearConfirmModal(false);
                  setSecurityPhrase('');
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  securityPhrase === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
