import React, { useState } from 'react';
import { UserProfile, UserRole, ActiveView } from '../types';
import { ROLE_ACCOUNTS } from '../mockData';

interface AuthPortalViewProps {
  currentUser: UserProfile;
  onLoginAs: (user: UserProfile) => void;
  onNavigate: (view: ActiveView) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  currentUser,
  onLoginAs,
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('jakkrinsonsing9@gmail.com');
  const [password, setPassword] = useState('AdminPass@Secure2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreedPdpa, setAgreedPdpa] = useState(false);

  // Live password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = getPasswordStrength(regPassword);

  const handleFastFill = (role: UserRole) => {
    setActiveTab('login');
    setSelectedRole('admin');
    setEmail('jakkrinsonsing9@gmail.com');
    setPassword('AdminPass@Secure2025');
    onShowToast('กรอกบัญชีแอดมิน', 'เลือกบัญชีแอดมินสูงสุด (jakkrinsonsing9@gmail.com) แล้ว', 'info');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    let loggedUser: UserProfile;

    if (
      normalizedEmail === 'jakkrinsonsing9@gmail.com' ||
      normalizedEmail === 'somchai.s@univ.ac.th' ||
      selectedRole === 'admin'
    ) {
      loggedUser = {
        ...ROLE_ACCOUNTS.admin,
        email: 'jakkrinsonsing9@gmail.com',
      };
    } else {
      // Check if user is in technicians localStorage
      let techMatch: any = null;
      try {
        const savedTechs = localStorage.getItem('it_technicians');
        if (savedTechs) {
          const parsedTechs = JSON.parse(savedTechs);
          techMatch = parsedTechs.find((t: any) => t.email?.toLowerCase() === normalizedEmail || t.name?.toLowerCase().includes(normalizedEmail.split('@')[0]));
        }
      } catch (err) {
        // ignore
      }

      if (techMatch || selectedRole === 'technician') {
        loggedUser = {
          id: techMatch?.id || 'usr-tech-' + Date.now(),
          name: techMatch?.name || normalizedEmail.split('@')[0] || 'ช่างเทคนิค',
          email: normalizedEmail,
          role: 'technician',
          roleLabel: 'ช่างเทคนิคไอที (IT Technician)',
          department: techMatch?.department || 'ฝ่ายบริการอุปกรณ์และระบบ',
          phone: techMatch?.phone || '085-000-0000',
          avatar:
            techMatch?.avatar ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAfP2hFoqefB-ZXmay836sp_LlaLisj-lQcqAgBxFCIbZGWUaVN06HRgYAEhCBdZHBGiiXairDtSQhEiEFhsIJ0Eslqdy3jmP9FldoJbEyGWUV7U2o7dyY-V7BdignbAHcLn3ZvFte-ShZKDBS4ltDnF1K53JHvpYUMTD7_lC88u3iovlrORGf5Bqlc6-7Hbghetn3t0KMaOVa4MZp22oB6peu1ANtjQeUhiG6_WxiWRlFwN9IvrXI',
          campus: 'วิทยาเขตหลัก (Main Campus)',
          techCode: techMatch?.code || 'IT-TECH',
        };
      } else {
        loggedUser = {
          id: 'usr-' + Date.now(),
          name: normalizedEmail.split('@')[0] || 'ผู้ใช้บริการ',
          email: normalizedEmail,
          role: 'user',
          roleLabel: 'ผู้ใช้บริการ (Staff / Requester)',
          department: 'แผนกบุคลากรและหน่วยงาน',
          phone: '089-123-4567',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDiJQsCwr1VqyJmlbGqb8jbSLyYbEle1fwdDCyk1HawtrgmprFZP0-AVsCqR_0ovHtWx7buZKrA280iqm01bYMZJ-BwtG1f1hRofUn7QxXZ1k0gbAooMBzHP-_kkx0Vvg2V3UvjkyMTVXyySjNWftjwl3kAJz7CPCEypnDPu-UL5z-Zpw208VSAFeJnho1oxV3FmYYMbPNHjBXltJqfSjxy16g_5dZmrxP-G7FeAeAVyuDv_z54GZk',
          campus: 'วิทยาเขตหลัก (Main Campus)',
        };
      }
    }

    onLoginAs(loggedUser);
    try {
      localStorage.setItem('user_profile', JSON.stringify(loggedUser));
    } catch (err) {
      // ignore
    }

    const roleName =
      loggedUser.role === 'admin'
        ? 'แอดมินสูงสุด (Super Admin)'
        : loggedUser.role === 'technician'
        ? 'ช่างเทคนิคไอที'
        : 'ผู้ใช้บริการ';

    onShowToast('เข้าสู่ระบบสำเร็จ', `เข้าสู่ระบบด้วยอีเมล ${loggedUser.email} (${roleName})`, 'success');

    if (loggedUser.role === 'admin') {
      onNavigate('dashboard');
    } else if (loggedUser.role === 'technician') {
      onNavigate('tech-workspace');
    } else {
      onNavigate('my-tickets');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      onShowToast('ข้อผิดพลาด', 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    if (!agreedPdpa) {
      onShowToast('ข้อผิดพลาด', 'กรุณายินยอมตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)', 'error');
      return;
    }

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: regFullName || 'ผู้ใช้งานใหม่',
      email: regEmail,
      role: 'user',
      roleLabel: 'บุคลากรองค์กร (Staff)',
      department: regDept || 'หน่วยงานทั่วไป',
      phone: regPhone || '089-123-4567',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBZP4i6GSi7K5f0xsm5j-RfUi6uYudZfHVh9lArt79t_L4nOsZx7bpVHvXZYqKWHoSq90nNXv3YZUQhGb-Tg8KkjtEVvLKSCByu8Z6JuhqRQfDJoVVC9CPhQDyeqpuIEYLcPco-AO4VmYRNUx9IStU8SB_8Kjdln5MfxWW1Tl8fVdAeuNnfMhnhzHXHigbufHgdKmxM-J1DwzYMiat72U2KTqsaBeeoEW3r1HsreiKm85-AKVb6PyA',
      campus: 'วิทยาเขตหลัก (Main Campus)',
    };

    onLoginAs(newUser);
    onShowToast('ลงทะเบียนสำเร็จ', `เปิดใช้งานบัญชี ${newUser.name} เรียบร้อยแล้ว`, 'success');
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-between selection:bg-blue-100 selection:text-[#143ee4]">
      {/* Top Header */}
      <header className="w-full bg-white/80 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#143ee4] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[22px]">
              support_agent
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                Nexus Desk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#143ee4] text-[10px] uppercase font-bold">
                IT Portal
              </span>
            </div>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              ระบบแจ้งซ่อมและบริการ IT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ระบบปฏิบัติการปกติ (All Systems Operational)</span>
          </div>

          <button
            onClick={() =>
              onShowToast('ศูนย์ช่วยเหลือ', 'โทรติดต่อเจ้าหน้าที่ศูนย์ไอที: 02-613-3999 ต่อ 999', 'info')
            }
            className="text-xs text-slate-600 hover:text-[#143ee4] font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              contact_support
            </span>
            <span className="hidden sm:inline">ติดต่อสนับสนุน</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#143ee4] text-xs font-bold transition-colors"
          >
            เข้าสู่แดชบอร์ด
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col justify-center items-center py-8 px-4 sm:px-8">
        <div className="relative w-full max-w-6xl">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-12 -left-12 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute -bottom-16 -right-12 w-80 h-80 bg-cyan-200/35 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Dual Split Card */}
          <div className="w-full bg-white shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px] border border-slate-200/80">
            {/* LEFT PANEL: Enterprise Identity, Statistics & Assurance (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative">
              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#143ee4] text-xs font-bold shadow-xs border border-blue-100">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="uppercase tracking-wider">Enterprise IT Governance</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider block mb-1">
                    Single Sign-On & Incident Center
                  </span>
                  <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    ระบบศูนย์บริการและจัดการแจ้งซ่อมไอที
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    แพลตฟอร์มบริหารจัดการคำร้อง แจ้งปัญหาเครือข่าย ซอฟต์แวร์ และอุปกรณ์ดิจิทัลสำหรับบุคลากรและนักศึกษา
                  </p>
                </div>

                {/* Key Metrics Cluster */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200/70 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[#143ee4] text-[22px]">
                        nest_clock_farsight_analog
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#143ee4]">
                        SLA
                      </span>
                    </div>
                    <span className="font-headline text-xl font-bold text-slate-900 mt-1">
                      &lt; 30 นาที
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ระยะเวลาเริ่มตอบรับเฉลี่ย
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200/70 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-cyan-700 text-[22px]">
                        published_with_changes
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800">
                        24/7
                      </span>
                    </div>
                    <span className="font-headline text-xl font-bold text-slate-900 mt-1">
                      99.98%
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ความพร้อมบริการระบบ
                    </span>
                  </div>
                </div>

                {/* Features Bullets */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#143ee4] flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
                      <span className="material-symbols-outlined text-[18px]">security</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Argon2id / bcrypt Tier-4 Cryptography
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed">
                        รหัสผ่านได้รับการแฮชด้วยมาตรวิทยาความปลอดภัยสูงสุด ป้องกัน Brute-force ทุกช่องทาง
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#143ee4] flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
                      <span className="material-symbols-outlined text-[18px]">policy</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        PDPA Data Masking Compliance
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed">
                        มาตรการคุ้มครองข้อมูลส่วนบุคคล หมายเลขโทรศัพท์จะถูกเข้ารหัสและปกปิดแบบ Dynamic Masking (08X-XXX-1234)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Super Admin Card */}
                <div className="p-4 rounded-2xl bg-blue-100/50 border border-blue-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                        admin_panel_settings
                      </span>
                      เข้าสู่ระบบแอดมินผู้ดูแลระบบหลัก
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#143ee4]">
                      SUPER ADMIN
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFastFill('admin')}
                    className="w-full p-3 rounded-xl text-left border border-blue-300 bg-white hover:bg-blue-50 transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          🛡️ บัญชีแอดมินสูงสุด (Super Admin)
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-[#143ee4]">
                          อำนาจสูงสุด
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#143ee4] font-semibold block mt-0.5">
                        jakkrinsonsing9@gmail.com
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#143ee4] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      คลิกเพื่อกรอก
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Left Footer Info */}
              <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#143ee4]">
                    headset_mic
                  </span>
                  <span>สายด่วนไอที: 02-613-3999 ต่อ 999</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  v4.2-LTS
                </span>
              </div>
            </div>

            {/* RIGHT PANEL: Tab Controller + Interactive Forms (7 cols) */}
            <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-white">
              <div>
                {/* Switcher Tab Buttons */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'login'
                          ? 'bg-white text-[#143ee4] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>เข้าสู่ระบบ (Sign In)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'register'
                          ? 'bg-white text-[#143ee4] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        person_add
                      </span>
                      <span>ลงทะเบียน (Create Account)</span>
                    </button>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>TLS 1.3 Active</span>
                  </div>
                </div>

                {/* TAB 1: LOGIN FORM */}
                {activeTab === 'login' ? (
                  <div className="py-4 space-y-5 animate-in fade-in-50">
                    <div>
                      <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                        ยินดีต้อนรับกลับสู่ระบบ
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        กรอกข้อมูลบัญชีองค์กร หรือเลือกบทบาทเพื่อเข้าสู่แดชบอร์ดงานแจ้งซ่อม
                      </p>
                    </div>

                    {/* Role Selector Segmented Control */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 block">
                        เลือกประเภทบัญชีผู้ใช้ (Account Role)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('admin')}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            selectedRole === 'admin'
                              ? 'bg-white text-[#143ee4] shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <span>🛡️</span>
                          <span>แอดมิน (Admin)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('technician')}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            selectedRole === 'technician'
                              ? 'bg-white text-amber-800 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <span>🛠️</span>
                          <span>ช่างเทคนิค</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('user')}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                            selectedRole === 'user'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <span>👤</span>
                          <span>ผู้ใช้บริการ</span>
                        </button>
                      </div>
                    </div>

                    {/* SSO Fast Login Row */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const adminAcc = ROLE_ACCOUNTS.admin;
                            onLoginAs(adminAcc);
                            try {
                              localStorage.setItem('user_profile', JSON.stringify(adminAcc));
                            } catch (e) {}
                            onShowToast('Google Workspace Login', `เข้าสู่ระบบสำเร็จในชื่อ ${adminAcc.name} (Super Admin)`, 'success');
                            onNavigate('dashboard');
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="truncate">Google: jakkrinsonsing9@gmail.com</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onShowToast('Microsoft SSO', 'กำลังเชื่อมต่อระบบบัญชี Microsoft 365...', 'info');
                            setTimeout(() => {
                              onNavigate('dashboard');
                            }, 400);
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <rect fill="#F25022" height="10" width="10" x="1" y="1" />
                            <rect fill="#7FBA00" height="10" width="10" x="13" y="1" />
                            <rect fill="#00A4EF" height="10" width="10" x="1" y="13" />
                            <rect fill="#FFB900" height="10" width="10" x="13" y="13" />
                          </svg>
                          <span>Microsoft 365 Azure</span>
                        </button>
                      </div>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow h-px bg-slate-200"></div>
                        <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                          หรือล็อกอินด้วยอีเมล
                        </span>
                        <div className="flex-grow h-px bg-slate-200"></div>
                      </div>
                    </div>

                    {/* Email & Password Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-900">
                            อีเมลที่ใช้งาน (Email Address)
                          </label>
                          {email.trim().toLowerCase() === 'jakkrinsonsing9@gmail.com' && (
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              🛡️ สิทธิ์แอดมินสูงสุด (Super Admin)
                            </span>
                          )}
                          {email.trim().toLowerCase() === 'worawit.y@univ.ac.th' && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              🛠️ สิทธิ์ช่างเทคนิค (IT-04)
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                            alternate_email
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jakkrinsonsing9@gmail.com หรือ email@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#143ee4]/20"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          รองรับทั้ง Gmail, อีเมลมหาวิทยาลัย, หรืออีเมลองค์กรทุกโดเมน
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-900">
                            รหัสผ่าน (Password)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              onShowToast('ลืมรหัสผ่าน', 'กรุณาติดต่อผู้ดูแลศูนย์ไอที โทร 02-613-3999 ต่อ 999', 'info')
                            }
                            className="text-xs text-[#143ee4] hover:underline font-bold"
                          >
                            ลืมรหัสผ่าน? (Forgot Password)
                          </button>
                        </div>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                            lock
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#143ee4]/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded text-[#143ee4]"
                          />
                          <span className="text-xs text-slate-600 font-medium">
                            จดจำการเข้าสู่ระบบในอุปกรณ์นี้ (Remember Me 30 วัน)
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          login
                        </span>
                        <span>เข้าสู่ระบบ (Sign In)</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* TAB 2: REGISTER FORM */
                  <div className="py-4 space-y-4 animate-in fade-in-50">
                    <div>
                      <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                        ลงทะเบียนเปิดใช้งานบัญชีใหม่
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        เฉพาะบุคลากร อาจารย์ และนักศึกษาที่มีอีเมลสังกัดมหาวิทยาลัย/องค์กร
                      </p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-900 mb-1">
                            ชื่อ - นามสกุล <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="นายสมชาย ใจดี"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 mb-1">
                            อีเมลองค์กร (@univ.ac.th) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="somchai.j@univ.ac.th"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-900 mb-1">
                            เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="081-234-5678"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 mb-1">
                            แผนก / คณะวิชา <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                          >
                            <option value="">เลือกคณะ / แผนกงาน</option>
                            <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                            <option value="คณะวิทยาศาสตร์และเทคโนโลยี">คณะวิทยาศาสตร์และเทคโนโลยี</option>
                            <option value="คณะพาณิชยศาสตร์และการบัญชี">คณะพาณิชยศาสตร์และการบัญชี</option>
                            <option value="สำนักวิทยบริการและเทคโนโลยีสารสนเทศ">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</option>
                            <option value="กองบริหารงานบุคคลและงานกลาง">กองบริหารงานบุคคลและงานกลาง</option>
                          </select>
                        </div>
                      </div>

                      {/* Password + Strength meter */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-900">
                          รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="รหัสผ่านปลอดภัย"
                            className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {showRegPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>

                        {/* Strength Indicator */}
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              ระดับความปลอดภัย:{' '}
                              <strong
                                className={
                                  pwdScore >= 3
                                    ? 'text-emerald-600'
                                    : pwdScore === 2
                                    ? 'text-amber-600'
                                    : 'text-red-500'
                                }
                              >
                                {pwdScore >= 3
                                  ? 'ปลอดภัยสูง (Strong)'
                                  : pwdScore === 2
                                  ? 'ปานกลาง (Fair)'
                                  : 'เปราะบาง (Weak)'}
                              </strong>
                            </span>
                            <span className="text-slate-400">
                              พิมพ์ใหญ่ + ตัวเลข + สัญลักษณ์
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pwdScore >= 1 ? 'bg-red-500' : 'bg-transparent'
                              }`}
                            ></div>
                            <div
                              className={`h-full rounded-full ${
                                pwdScore >= 2 ? 'bg-amber-500' : 'bg-transparent'
                              }`}
                            ></div>
                            <div
                              className={`h-full rounded-full ${
                                pwdScore >= 3 ? 'bg-blue-500' : 'bg-transparent'
                              }`}
                            ></div>
                            <div
                              className={`h-full rounded-full ${
                                pwdScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                        />
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={agreedPdpa}
                          onChange={(e) => setAgreedPdpa(e.target.checked)}
                          required
                          className="w-4 h-4 mt-0.5 rounded text-[#143ee4]"
                        />
                        <span className="text-xs text-slate-600 leading-snug">
                          ฉันรับทราบและยินยอมตาม{' '}
                          <a href="#" className="text-[#143ee4] underline font-bold">
                            นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                          </a>{' '}
                          และข้อตกลงการเข้าใช้บริการเทคโนโลยีสารสนเทศส่วนกลาง
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white font-bold text-sm shadow-md transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          how_to_reg
                        </span>
                        <span>สร้างบัญชีผู้ใช้งาน (Register Account)</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Compliance & Security Assurance Strip */}
              <div className="mt-6 pt-4 bg-slate-50 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-cyan-700 text-[18px]">
                    enhanced_encryption
                  </span>
                  <span>256-bit SSL/TLS & Hash Argon2 Compliance</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#143ee4]">
                  <span className="material-symbols-outlined text-[18px]">
                    verified_user
                  </span>
                  <span>PDPA Data Masking Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/90 py-4 px-4 sm:px-8 border-t border-slate-200/70 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-700 text-[16px]">
              verified_user
            </span>
            <span>ISO/IEC 27001 Certified • Enterprise IT Security Standard</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2025 Nexus Service Desk. สงวนลิขสิทธิ์ทั้งหมด</span>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-[#143ee4]">
              นโยบายความเป็นส่วนตัว
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
