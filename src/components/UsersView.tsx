import React, { useState } from 'react';
import { Technician, AppTheme, UserProfile, ActiveView, UserRole } from '../types';

interface UsersViewProps {
  technicians: Technician[];
  currentUser?: UserProfile;
  theme: AppTheme;
  onUpdateTechStatus: (techId: string, status: 'available' | 'busy' | 'remote') => void;
  onAddTechnician?: (newTech: Technician) => void;
  onDeleteTechnician?: (techId: string) => void;
  onUpdateTechnician?: (updatedTech: Technician) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: ActiveView) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  technicians,
  currentUser,
  theme,
  onUpdateTechStatus,
  onAddTechnician,
  onDeleteTechnician,
  onUpdateTechnician,
  onShowToast,
  onNavigate,
  onSwitchRole,
}) => {
  const isNeu = theme === 'neumorphic';
  const isAdmin = currentUser?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy' | 'remote'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    role: 'ช่างเทคนิคฮาร์ดแวร์ & โสตฯ',
    department: 'ฝ่ายบริการอุปกรณ์คอมพิวเตอร์',
    location: 'ศูนย์คอมพิวเตอร์ อาคาร 1',
    phone: '081-000-0000',
    extension: '4410',
    status: 'available' as 'available' | 'busy' | 'remote',
    avatar: '',
  });

  const avatarPresets = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAfP2hFoqefB-ZXmay836sp_LlaLisj-lQcqAgBxFCIbZGWUaVN06HRgYAEhCBdZHBGiiXairDtSQhEiEFhsIJ0Eslqdy3jmP9FldoJbEyGWUV7U2o7dyY-V7BdignbAHcLn3ZvFte-ShZKDBS4ltDnF1K53JHvpYUMTD7_lC88u3iovlrORGf5Bqlc6-7Hbghetn3t0KMaOVa4MZp22oB6peu1ANtjQeUhiG6_WxiWRlFwN9IvrXI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAFB3Q2fOssupJ0qcvL__-Tu5gs5hO7k5jjuPWX0iaSZZ7lBVOzwLbMV-gp0Nqpgonu_V2vAMDwDMEO0lvqPF1zbfvtkbnc8DmxRl0na6Zay5-jMQFHmsth5FnGQDEv126FqrEgWst9EEXyedudkstLR1ykISScgLWCbsosxTLoMRcjZnuKhkUoyUQtGcIz0EMPkWcvN7RaoHnau6FK6WUDh2Ozu2wDgF05UW2DFQJu10Frr8Bro9U',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxqIBX1Ai2kASVAhVrvt2vcmjkiKFW7JcCxvIvHiIOi5Zhzib5ZDA2ZdJulA8oUdoTDIV9ehKEYdQvCZBVA44389rZnP36Oetlb3D8OL6YDgQwBJoARVku744i1Gm4GruiXKnzn3aArCtQABlimQ08eGucDRMWSn9AMi44It0AAYqCK3APM3qZD6E6vf56NK7RAaTwUyx8yqKtgovN-TppAthd-fEoWdg20HRgXCFGfDidffT4KhI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRx8sBBcPz8sybMlgMQl_qXmLMkO991RJsPgfySKZZxUGzhe0TXh_0gB3GcWSGH9fKezyPY1x4Sdpgf-f-TtsWep1cupW2EZtg9tuaGZH6ym3Tbj8DLaamn0e4GY0WCcl72IZid26YLtEYtys1w92ZMhBwuL2HzGBacaqMWgIzrvwluZ5aC4zQyDzPdxh4xgIUNr7ddIJEeN7hRntrPErTXtBa9wsunNQbvjABe-fOnHVlzax6vZY',
  ];

  const handleOpenAddModal = () => {
    const nextCodeNum = technicians.length + 1;
    const padded = nextCodeNum < 10 ? `0${nextCodeNum * 2}` : `${nextCodeNum * 2}`;
    setFormData({
      name: '',
      code: `IT-${padded}`,
      role: 'ช่างเทคนิคฮาร์ดแวร์ & ประจำจุด',
      department: 'ฝ่ายบริการอุปกรณ์คอมพิวเตอร์และเครือข่าย',
      location: 'หน้างาน: อาคารเรียนรวมและสำนักงาน',
      phone: '085-123-4567',
      extension: `44${padded}`,
      status: 'available',
      avatar: avatarPresets[technicians.length % avatarPresets.length],
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (t: Technician) => {
    setEditingTech(t);
    setFormData({
      name: t.name,
      code: t.code,
      role: t.role,
      department: t.department,
      location: t.location,
      phone: t.phone,
      extension: t.extension,
      status: t.status,
      avatar: t.avatar,
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อ-นามสกุลของช่าง', 'error');
      return;
    }

    const newTech: Technician = {
      id: 'tech-' + Date.now(),
      name: formData.name.trim(),
      code: formData.code.trim() || `IT-0${technicians.length + 1}`,
      role: formData.role,
      department: formData.department,
      location: formData.location,
      phone: formData.phone,
      extension: formData.extension,
      status: formData.status,
      activeLoad: 0,
      avatar: formData.avatar || avatarPresets[0],
    };

    if (onAddTechnician) {
      onAddTechnician(newTech);
    }
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;
    if (!formData.name.trim()) {
      onShowToast('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อ-นามสกุลของช่าง', 'error');
      return;
    }

    const updated: Technician = {
      ...editingTech,
      name: formData.name.trim(),
      code: formData.code.trim(),
      role: formData.role,
      department: formData.department,
      location: formData.location,
      phone: formData.phone,
      extension: formData.extension,
      status: formData.status,
      avatar: formData.avatar || editingTech.avatar,
    };

    if (onUpdateTechnician) {
      onUpdateTechnician(updated);
    }
    setEditingTech(null);
  };

  const handleConfirmDelete = () => {
    if (!techToDelete) return;
    if (onDeleteTechnician) {
      onDeleteTechnician(techToDelete.id);
    }
    setTechToDelete(null);
  };

  const filteredTechs = technicians.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const cardCls = isNeu
    ? 'neu-card p-6'
    : 'bg-white rounded-3xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Admin Authority Banner */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-amber-400">
                  สิทธิ์แอดมินสูงสุด (Super Admin Authority: {currentUser?.email})
                </span>
                <span className="text-[11px] text-white/70 font-mono">Full Manage Permissions</span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                คุณมีอำนาจสูงสุดในการเลือกแต่งตั้งบุคคลเป็นช่าง เพิ่มช่างใหม่ ปรับข้อมูล หรือลบช่างออกจากทีม
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ แต่งตั้ง / เพิ่มช่างใหม่</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('admin-center')}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">shield_with_heart</span>
                <span>ศูนย์อำนาจแอดมิน</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
              ทีมช่างและบุคลากรปฏิบัติการ (Technicians Roster)
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-[#143ee4]">
              {technicians.length} คน
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รายชื่อช่างเทคนิคที่ปฏิบัติหน้าที่ พร้อมความสามารถในการเลือกและลบช่างโดยแอดมิน
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาช่าง, รหัส หรือตำแหน่ง..."
              className={`h-10 pl-9 pr-4 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-100 border border-slate-200'
              }`}
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-slate-400">
              search
            </span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
          >
            <option value="all">สถานะทั้งหมด ({technicians.length})</option>
            <option value="available">🟢 ว่างพร้อมรับงาน ({technicians.filter((t) => t.status === 'available').length})</option>
            <option value="busy">🟠 ติดงานซ่อม ({technicians.filter((t) => t.status === 'busy').length})</option>
            <option value="remote">🔵 กำลัง Remote ({technicians.filter((t) => t.status === 'remote').length})</option>
          </select>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className={`px-4 py-2 h-10 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm ${
                isNeu ? 'neu-button text-[#143ee4]' : 'bg-[#143ee4] text-white hover:bg-[#1034bf]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>เพิ่มช่าง</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Technicians */}
      {filteredTechs.length === 0 ? (
        <div className={`${cardCls} text-center py-12`}>
          <span className="material-symbols-outlined text-4xl text-slate-400">group_off</span>
          <h3 className="font-bold text-slate-800 text-base mt-2">ไม่พบรายชื่อช่าง</h3>
          <p className="text-xs text-slate-500 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มช่าง" เพื่อแต่งตั้งช่างคนใหม่
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#143ee4] text-white hover:bg-[#1034bf] inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>เพิ่มช่างคนแรก</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTechs.map((t) => (
            <div
              key={t.id}
              className={`${cardCls} flex flex-col justify-between hover:shadow-md transition-shadow relative group`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-200 shadow-xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                        t.status === 'available'
                          ? 'bg-emerald-500'
                          : t.status === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      title={
                        t.status === 'available'
                          ? 'สถานะ: พร้อมรับงาน'
                          : t.status === 'busy'
                          ? 'สถานะ: ติดงานซ่อม'
                          : 'สถานะ: Remote'
                      }
                    ></span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {t.code}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          title="แก้ไขข้อมูลช่าง"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-[#143ee4] flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button
                          onClick={() => setTechToDelete(t)}
                          title="ลบออกจากรายชื่อช่าง"
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    {t.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#143ee4] block mt-0.5">
                    {t.role}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {t.department}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>ตำแหน่งหน้างาน:</span>
                    <span className="font-medium text-slate-900">{t.location}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>เบอร์โทร / ต่อ:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {t.phone} (ต่อ {t.extension})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ภาระงานคงค้าง:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        t.activeLoad === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.activeLoad === 0 ? 'ว่างรับงาน' : `${t.activeLoad} ใบงาน`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status switcher footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {isAdmin ? 'สิทธิ์แอดมินปรับ:' : 'สถานะ:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onUpdateTechStatus(t.id, 'available');
                      onShowToast('อัปเดตสถานะ', `${t.name} พร้อมรับงานแล้ว`, 'success');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      t.status === 'available'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    พร้อม
                  </button>
                  <button
                    onClick={() => {
                      onUpdateTechStatus(t.id, 'busy');
                      onShowToast('อัปเดตสถานะ', `${t.name} กำลังติดงานซ่อม`, 'info');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      t.status === 'busy'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ติดงาน
                  </button>
                  <button
                    onClick={() => {
                      onUpdateTechStatus(t.id, 'remote');
                      onShowToast('อัปเดตสถานะ', `${t.name} กำลัง Remote`, 'info');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                      t.status === 'remote'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Remote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Technician / Appoint */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#143ee4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-slate-900">
                    แต่งตั้ง / เพิ่มช่างเทคนิคใหม่
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดบทบาทและมอบหมายรหัสประจำตัวช่าง
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ชื่อ-นามสกุลช่าง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น วรวิทย์ ยิ่งยง"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    รหัสประจำตัวช่าง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="เช่น IT-04"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ความเชี่ยวชาญ / หน้าที่หลัก
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none text-slate-900 font-medium"
                >
                  <option value="ช่างฮาร์ดแวร์ & โสตฯ">ช่างฮาร์ดแวร์ & โสตฯ (Hardware & AV)</option>
                  <option value="วิศวกรระบบเครือข่าย">วิศวกรระบบเครือข่าย (Network & Security)</option>
                  <option value="บริการซอฟต์แวร์และแอป">บริการซอฟต์แวร์และแอป (Software Support)</option>
                  <option value="ช่างเทคนิคโครงข่ายและสายสัญญาณ">ช่างเทคนิคโครงข่ายและสายสัญญาณ (Infrastructure)</option>
                  <option value="เจ้าหน้าที่สนับสนุนไอทีทั่วไป">เจ้าหน้าที่สนับสนุนไอทีทั่วไป (General IT Support)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สังกัด / แผนก</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ตำแหน่งหน้างาน</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์มือถือ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์ต่อภายใน</label>
                  <input
                    type="text"
                    value={formData.extension}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">สถานะเริ่มต้น</label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="status"
                      value="available"
                      checked={formData.status === 'available'}
                      onChange={() => setFormData({ ...formData, status: 'available' })}
                    />
                    <span className="font-bold text-emerald-700">พร้อมรับงาน</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="status"
                      value="busy"
                      checked={formData.status === 'busy'}
                      onChange={() => setFormData({ ...formData, status: 'busy' })}
                    />
                    <span className="font-bold text-amber-700">ติดงานซ่อม</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#143ee4] hover:bg-[#1034bf] text-white shadow-md inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>บันทึกและแต่งตั้งช่าง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Technician */}
      {editingTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">edit</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-slate-900">
                    แก้ไขข้อมูลช่าง: {editingTech.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    รหัสปัจจุบัน: {editingTech.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTech(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">รหัสช่าง</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#143ee4] text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ความเชี่ยวชาญ / บทบาท</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สังกัด / แผนก</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ตำแหน่งหน้างาน</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์มือถือ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์ต่อภายใน</label>
                  <input
                    type="text"
                    value={formData.extension}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#143ee4] hover:bg-[#1034bf] text-white shadow-md inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Technician */}
      {techToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-900 text-center">
              ยืนยันการลบช่างคนนี้?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              คุณกำลังจะลบ <b>{techToDelete.name} ({techToDelete.code})</b> ออกจากรายชื่อทีมช่างปฏิบัติการ
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
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>ยืนยันลบช่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
