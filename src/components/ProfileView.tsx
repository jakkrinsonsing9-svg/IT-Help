import React, { useState, useRef } from 'react';
import { UserProfile, UserRole, AppTheme } from '../types';

interface ProfileViewProps {
  currentUser: UserProfile;
  theme: AppTheme;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const PRESET_AVATARS = [
  {
    label: 'จักรินทร์ (Super Admin)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnWTsL_F2iP2oickxsBBUrQu5xTSfx2c1ubl5wm7wjXarPHiWrFJITGxiQJatzdfhybnmHFLyCoMwxIXxAhyMoxV59crpYJ3PpLl9_NDgB-WTK7xj7YTxoc7EW9ZcZLXveb3cuYFc_J-vgMMtrBoOSQ2MAhXm6JfJKtx3pn0lOvIXq3pt8GIRgknFMFZvDj2oH9xdv-H_eLPBIVotoHN8PkQiQY_x6cGPeE4YUxmsLjUHd8hL9VR0',
  },
  {
    label: 'รูปโปรไฟล์ A (ฝ่ายเทคโนโลยี)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfP2hFoqefB-ZXmay836sp_LlaLisj-lQcqAgBxFCIbZGWUaVN06HRgYAEhCBdZHBGiiXairDtSQhEiEFhsIJ0Eslqdy3jmP9FldoJbEyGWUV7U2o7dyY-V7BdignbAHcLn3ZvFte-ShZKDBS4ltDnF1K53JHvpYUMTD7_lC88u3iovlrORGf5Bqlc6-7Hbghetn3t0KMaOVa4MZp22oB6peu1ANtjQeUhiG6_WxiWRlFwN9IvrXI',
  },
  {
    label: 'รูปโปรไฟล์ B (วิศวกรระบบ)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFB3Q2fOssupJ0qcvL__-Tu5gs5hO7k5jjuPWX0iaSZZ7lBVOzwLbMV-gp0Nqpgonu_V2vAMDwDMEO0lvqPF1zbfvtkbnc8DmxRl0na6Zay5-jMQFHmsth5FnGQDEv126FqrEgWst9EEXyedudkstLR1ykISScgLWCbsosxTLoMRcjZnuKhkUoyUQtGcIz0EMPkWcvN7RaoHnau6FK6WUDh2Ozu2wDgF05UW2DFQJu10Frr8Bro9U',
  },
  {
    label: 'รูปโปรไฟล์ C (ช่างซอฟต์แวร์)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxqIBX1Ai2kASVAhVrvt2vcmjkiKFW7JcCxvIvHiIOi5Zhzib5ZDA2ZdJulA8oUdoTDIV9ehKEYdQvCZBVA44389rZnP36Oetlb3D8OL6YDgQwBJoARVku744i1Gm4GruiXKnzn3aArCtQABlimQ08eGucDRMWSn9AMi44It0AAYqCK3APM3qZD6E6vf56NK7RAaTwUyx8yqKtgovN-TppAthd-fEoWdg20HRgXCFGfDidffT4KhI',
  },
  {
    label: 'รูปโปรไฟล์ D (ผู้ปฏิบัติการ)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRx8sBBcPz8sybMlgMQl_qXmLMkO991RJsPgfySKZZxUGzhe0TXh_0gB3GcWSGH9fKezyPY1x4Sdpgf-f-TtsWep1cupW2EZtg9tuaGZH6ym3Tbj8DLaamn0e4GY0WCcl72IZid26YLtEYtys1w92ZMhBwuL2HzGBacaqMWgIzrvwluZ5aC4zQyDzPdxh4xgIUNr7ddIJEeN7hRntrPErTXtBa9wsunNQbvjABe-fOnHVlzax6vZY',
  },
  {
    label: 'รูปโปรไฟล์ E (ผู้ใช้งานทั่วไป)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiJQsCwr1VqyJmlbGqb8jbSLyYbEle1fwdDCyk1HawtrgmprFZP0-AVsCqR_0ovHtWx7buZKrA280iqm01bYMZJ-BwtG1f1hRofUn7QxXZ1k0gbAooMBzHP-_kkx0Vvg2V3UvjkyMTVXyySjNWftjwl3kAJz7CPCEypnDPu-UL5z-Zpw208VSAFeJnho1oxV3FmYYMbPNHjBXltJqfSjxy16g_5dZmrxP-G7FeAeAVyuDv_z54GZk',
  },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  theme,
  onUpdateProfile,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [dept, setDept] = useState(currentUser.department);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customUrl, setCustomUrl] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  const cardCls = isNeu
    ? 'neu-card p-6 md:p-8'
    : 'bg-white rounded-2xl p-6 md:p-8 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('ไฟล์มีขนาดใหญ่เกินไป', 'กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 5 MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAvatar(result);
          onUpdateProfile({ avatar: result });
          setShowAvatarModal(false);
          onShowToast('เปลี่ยนรูปโปรไฟล์สำเร็จ', 'อัปโหลดรูปภาพใหม่จากเครื่องของคุณเรียบร้อยแล้ว', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    onUpdateProfile({ avatar: url });
    setShowAvatarModal(false);
    onShowToast('เปลี่ยนรูปโปรไฟล์สำเร็จ', 'เลือกรูปโปรไฟล์ใหม่เรียบร้อยแล้ว', 'success');
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setAvatar(customUrl.trim());
    onUpdateProfile({ avatar: customUrl.trim() });
    setCustomUrl('');
    setShowAvatarModal(false);
    onShowToast('เปลี่ยนรูปโปรไฟล์สำเร็จ', 'อัปเดตรูปจากลิงก์ URL เรียบร้อยแล้ว', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabel =
      role === 'admin'
        ? 'แอดมินระบบสูงสุด (Super Admin - อำนาจสูงสุด)'
        : role === 'technician'
        ? 'ช่างเทคนิคไอที (IT Technician)'
        : 'ผู้ใช้บริการ (Staff / Requester)';

    onUpdateProfile({
      name,
      phone,
      department: dept,
      avatar,
      role,
      roleLabel,
    });
    onShowToast(
      'บันทึกข้อมูลเรียบร้อย',
      `อัปเดตข้อมูลและสิทธิ์เป็น [${roleLabel}] สำเร็จ`,
      'success'
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
          โปรไฟล์และสิทธิ์การเข้าถึง (User Profile & Security)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          จัดการข้อมูลส่วนบุคคล บัญชีเชื่อมต่อ SSO และความปลอดภัยของระบบ
        </p>
      </div>

      <div className={cardCls}>
        {/* Profile Header Block with Avatar Change Trigger */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <img
              src={avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-100 shadow-md group-hover:brightness-90 transition-all cursor-pointer"
              onClick={() => setShowAvatarModal(true)}
            />
            {/* Quick change button badge */}
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-[#143ee4] hover:bg-[#1034bf] text-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 active:scale-95"
              title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>

          <div className="flex flex-col text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                {name || currentUser.name}
              </h2>
              <span className="material-symbols-outlined text-[#143ee4] text-[18px]">
                verified
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono mt-0.5">
              {currentUser.email}
            </span>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#143ee4] font-bold">
                {currentUser.roleLabel}
              </span>
              <span className="text-xs text-slate-400">• {currentUser.campus}</span>
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="text-xs text-[#143ee4] hover:underline font-semibold flex items-center gap-1 ml-1"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>เปลี่ยนรูปโปรไฟล์</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none ${
                  isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none ${
                  isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              สังกัดหน่วยงาน / แผนก
            </label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
              }`}
            />
          </div>

          {/* Role and Permissions Selector Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-900">
                  สิทธิ์การใช้งานในระบบ (Role & Permissions)
                </label>
                <p className="text-[11px] text-slate-500">
                  กำหนดสิทธิ์ในการเข้าถึงและจัดการระบบบริการเทคโนโลยีสารสนเทศ
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  role === 'admin'
                    ? 'bg-blue-100 text-[#143ee4]'
                    : role === 'technician'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {role === 'admin' && '🛡️ แอดมิน (อำนาจสูงสุด)'}
                {role === 'technician' && '🛠️ ช่างเทคนิคไอที'}
                {role === 'user' && '👤 ผู้ใช้บริการ (User)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Admin Card */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'admin'
                    ? 'bg-blue-50/70 border-[#143ee4] shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="mt-1 text-[#143ee4]"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    🛡️ แอดมิน (Super Admin)
                  </span>
                  <span className="text-[10px] text-[#143ee4] font-extrabold block">
                    อำนาจสูงสุด 100%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    จัดการทุกส่วน ลบ/ล้างข้อมูล บังคับมอบหมายงาน และกำหนดสิทธิ์ทุกคน
                  </span>
                </div>
              </label>

              {/* Technician Card */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'technician'
                    ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  value="technician"
                  checked={role === 'technician'}
                  onChange={() => setRole('technician')}
                  className="mt-1 text-amber-600"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    🛠️ ช่างเทคนิค (Technician)
                  </span>
                  <span className="text-[10px] text-amber-700 font-extrabold block">
                    ปฏิบัติการงานซ่อม
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    โต๊ะงานช่าง รับงานจากคลังกลาง (Claim) อัปเดตงานซ่อม และปิดงาน
                  </span>
                </div>
              </label>

              {/* User Card */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'user'
                    ? 'bg-emerald-50/70 border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    👤 ผู้ใช้บริการ (User / Staff)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-extrabold block">
                    แจ้งซ่อม & ติดตาม
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                    แจ้งปัญหาใหม่ ติดตามสถานะงานของตนเอง ส่งข้อความหาช่าง
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-headline font-bold text-sm text-slate-900">
              ความปลอดภัยและการเข้ารหัส (Security & Encryption)
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143ee4] text-[20px]">
                  lock
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    การยืนยันตัวตนสองขั้นตอน (2-Factor Authentication)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    เพิ่มความปลอดภัยด้วยรหัส OTP และแอป Authenticator
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="w-4 h-4 rounded text-[#143ee4]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-700 text-[20px]">
                  notifications_active
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    แจ้งเตือนสถานะใบงานผ่านอีเมล
                  </span>
                  <span className="text-[11px] text-slate-500">
                    รับรายงานความคืบหน้าเมื่อช่างเริ่มดำเนินการหรือแก้ไขเสร็จ
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[#143ee4]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm ${
                isNeu ? 'neu-primary-button' : 'bg-[#143ee4] hover:bg-[#1034bf]'
              }`}
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div
          onClick={() => setShowAvatarModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#143ee4] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                </div>
                <h3 className="font-headline font-bold text-sm text-slate-900">
                  เปลี่ยนรูปโปรไฟล์ (Change Profile Picture)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Option 1: Upload from local device */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  1. อัปโหลดรูปจากอุปกรณ์ของคุณ
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-blue-300 hover:border-[#143ee4] rounded-2xl bg-blue-50/40 hover:bg-blue-50/80 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-[#143ee4] shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                  </div>
                  <span className="text-xs font-bold text-[#143ee4]">
                    คลิกเพื่อเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ขนาดไฟล์ไม่เกิน 5 MB
                  </span>
                </button>
              </div>

              {/* Option 2: Choose from curated presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  2. หรือเลือกจากรูปโปรไฟล์สำเร็จรูป
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p.url)}
                      className={`group relative rounded-2xl overflow-hidden p-1 border-2 transition-all flex flex-col items-center gap-1 ${
                        avatar === p.url
                          ? 'border-[#143ee4] bg-blue-50 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center">
                        {p.label}
                      </span>
                      {avatar === p.url && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#143ee4] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Image URL input */}
              <form onSubmit={handleApplyCustomUrl} className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  3. หรือระบุลิงก์รูปภาพ (Image URL)
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#143ee4]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#143ee4] text-white text-xs font-bold hover:bg-[#1034bf] shrink-0"
                  >
                    ใช้งาน
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

