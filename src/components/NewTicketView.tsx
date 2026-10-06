import React, { useState } from 'react';
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  AppTheme,
  ActiveView,
  UserProfile,
} from '../types';

interface NewTicketViewProps {
  currentUser: UserProfile;
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onCreateTicket: (newTicket: Ticket) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const NewTicketView: React.FC<NewTicketViewProps> = ({
  currentUser,
  theme,
  onNavigate,
  onCreateTicket,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Computer');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('bld3-fl4-acc');
  const [room, setRoom] = useState('ห้อง 402 โต๊ะทำงาน 12');
  const [assetTag, setAssetTag] = useState('PC-ACC-2022-019');
  const [maskedPhone, setMaskedPhone] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; previewUrl: string }[]>([
    {
      name: 'screenshot_error_bluescreen.png',
      size: '1.8 MB',
      previewUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDoaWWesNNP7Y9AQ-zux0QozHioNRKG2qwupCl3aWRZZTiAqsTfhf2wXFifVvqTqTKY-6iomM3YgDYfXoX-vV_PNCUEvHiawgGa0-0-qktQzNz9vUKsxuXiOA4lGsyV_kWEKcFjnOpQYj23jNrA7d0kqfrfx-Nm_MzZnfPPxvYW91-XrvNfy6fEnfYqu5PzCVeiASC3hnQqQRLjfx10MDepvlhT1vMhTN46Eu_VtEPm2kfs4FW1dG4',
    },
  ]);

  const cardCls = isNeu
    ? 'neu-card p-6 md:p-7'
    : 'bg-white rounded-2xl p-6 md:p-7 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  const insertTemplate = (tmpl: string) => {
    setDescription((prev) => (prev ? prev + '\n\n' + tmpl : tmpl));
    onShowToast('แทรกแทมเพลต', 'เพิ่มโครงสร้างรายละเอียดปัญหาแล้ว', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newF = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDoaWWesNNP7Y9AQ-zux0QozHioNRKG2qwupCl3aWRZZTiAqsTfhf2wXFifVvqTqTKY-6iomM3YgDYfXoX-vV_PNCUEvHiawgGa0-0-qktQzNz9vUKsxuXiOA4lGsyV_kWEKcFjnOpQYj23jNrA7d0kqfrfx-Nm_MzZnfPPxvYW91-XrvNfy6fEnfYqu5PzCVeiASC3hnQqQRLjfx10MDepvlhT1vMhTN46Eu_VtEPm2kfs4FW1dG4',
      };
      setUploadedFiles((prev) => [...prev, newF]);
      onShowToast('อัปโหลดไฟล์', `แนบไฟล์ ${file.name} สำเร็จ`, 'success');
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    onShowToast('ลบไฟล์แนบ', 'นำไฟล์แนบออกเรียบร้อย', 'info');
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('Computer');
    setPriority('Medium');
    onShowToast('รีเซ็ตแบบฟอร์ม', 'ล้างข้อมูลที่กรอกเรียบร้อยแล้ว', 'info');
  };

  const handleSaveDraft = () => {
    onShowToast('บันทึกแบบร่าง', 'ระบบบันทึกแบบร่างใบแจ้งซ่อมลงในอุปกรณ์เรียบร้อยแล้ว', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      onShowToast('ข้อผิดพลาด', 'กรุณาระบุหัวข้อปัญหาและรายละเอียดให้ครบถ้วน', 'error');
      return;
    }

    const newTicketId = `TK-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: Ticket = {
      id: newTicketId,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Pending',
      requesterName: currentUser.name,
      requesterPhone: currentUser.phone,
      requesterEmail: currentUser.email,
      requesterDept: currentUser.department,
      requesterTitle: currentUser.role === 'admin' ? 'เจ้าหน้าที่ไอที' : 'บุคลากรประจำคณะ',
      requesterAvatar: currentUser.avatar,
      location:
        building === 'bld3-fl4-acc'
          ? 'อาคาร 3 ชั้น 4 แผนกบัญชีและการเงิน'
          : building === 'bld1-fl1-reg'
          ? 'อาคาร 1 ชั้น 1 สำนักส่งเสริมวิชาการและทะเบียน'
          : 'อาคารเฉลิมพระเกียรติ',
      roomDetails: room,
      assetTag: assetTag || 'PC-GENERAL-01',
      assetDevice: 'คอมพิวเตอร์ / อุปกรณ์สำนักงาน',
      impact:
        priority === 'Critical'
          ? 'กระทบการปฏิบัติงานเร่งด่วน'
          : 'กระทบงานทั่วไป',
      createdAt: 'วันนี้ • เมื่อสักครู่',
      createdAtRelative: 'เมื่อสักครู่',
      slaTargetHours: priority === 'Critical' ? 2 : priority === 'High' ? 4 : 8,
      slaRemainingText: 'SLA เป้าหมาย: ตอบรับภายใน 30 นาที',
      attachments: uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        time: 'แนบเมื่อสักครู่',
        url: f.previewUrl,
        previewUrl: f.previewUrl,
      })),
      timeline: [
        {
          id: 'step-1',
          title: `${currentUser.name} แจ้งปัญหาเข้าระบบ`,
          time: 'วันนี้ • เมื่อสักครู่',
          desc: `สร้างใบงาน #${newTicketId} หมวดหมู่ ${category} ระดับ ${priority}`,
          statusText: 'สถานะ: รอรับเรื่อง (Pending)',
          icon: 'flag',
          completed: true,
          isCurrent: true,
        },
      ],
      comments: [
        {
          id: 'com-init',
          senderName: currentUser.name,
          senderRole: 'ผู้แจ้งปัญหา',
          time: 'เมื่อสักครู่',
          text: description.trim(),
          isTech: false,
          avatar: currentUser.avatar,
        },
      ],
    };

    onCreateTicket(newTicket);
    onShowToast(
      'สร้างใบงานสำเร็จ',
      `สร้างใบแจ้งซ่อม #${newTicketId} เรียบร้อยแล้ว กำลังนำทางไปยังหน้ารายละเอียด...`,
      'success'
    );
    onNavigate('ticket-detail', newTicketId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-[#143ee4] transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>หน้าหลัก</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-[#143ee4]">
            แจ้งซ่อมใหม่ (Create Ticket)
          </span>
        </nav>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-semibold border border-cyan-100">
            <span className="material-symbols-outlined text-[16px] text-cyan-600">
              timer
            </span>
            <span>SLA เป้าหมายตอบกลับภายใน 30 นาที</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ระบบพร้อมรับเรื่อง (Online)</span>
          </div>
        </div>
      </div>

      {/* Section Header Banner */}
      <div className={`${cardCls} relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-100 text-[#143ee4] text-xs font-bold uppercase tracking-wider">
              Nexus Service Desk
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              สร้างใบแจ้งซ่อมใหม่ (New Support Ticket)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              กรอกข้อมูลและรายละเอียดปัญหาด้านไอที อุปกรณ์ หรือระบบซอฟต์แวร์ เพื่อให้เจ้าหน้าที่ฝ่ายเทคโนโลยีเข้าดำเนินการช่วยเหลืออย่างรวดเร็วและมีประสิทธิภาพ
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-[#143ee4] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[26px]">
                support_agent
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-slate-400 font-semibold">
                ฝ่ายสนับสนุนไอที
              </span>
              <span className="font-headline text-sm font-bold text-slate-900">
                ชั้น 2 อาคารอำนวยการ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Form (8:4 Grid) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Primary Ticket Data (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. ข้อมูลทั่วไป & หัวข้อปัญหา */}
          <div className={`${cardCls} space-y-5`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    assignment
                  </span>
                </div>
                <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                  ข้อมูลทั่วไป & หัวข้อปัญหา
                </h2>
              </div>
              <span className="text-xs text-red-500 font-semibold">* จำเป็นต้องระบุ</span>
            </div>

            {/* หัวข้อปัญหา */}
            <div className="space-y-1.5">
              <label
                htmlFor="ticket-title"
                className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900"
              >
                <span>
                  หัวข้อปัญหา (Ticket Title) <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ความยาวแนะนำ 15 - 100 ตัวอักษร
                </span>
              </label>
              <input
                id="ticket-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น เปิดคอมพิวเตอร์ไม่ติด ขึ้นจอฟ้า, ปริ้นเตอร์กระดาษติดพิมพ์ไม่ออก..."
                className={`w-full h-11 px-4 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  isNeu
                    ? 'neu-inset border-0'
                    : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                }`}
              />
            </div>

            {/* หมวดหมู่ปัญหา (Category Selector - 6 Cards) */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-900 block">
                หมวดหมู่ปัญหา (Category) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Computer', th: 'คอมพิวเตอร์ / ฮาร์ดแวร์', en: 'Computer / Hardware', icon: 'laptop_mac' },
                  { id: 'Network', th: 'ระบบเครือข่าย อินเทอร์เน็ต', en: 'Network & WiFi', icon: 'wifi' },
                  { id: 'Software', th: 'โปรแกรม และซอฟต์แวร์', en: 'Software / App', icon: 'widgets' },
                  { id: 'Printer', th: 'เครื่องพิมพ์ / สแกนเนอร์', en: 'Printer / Scanner', icon: 'print' },
                  { id: 'Account', th: 'บัญชีผู้ใช้ / รหัสผ่าน', en: 'Account & Access', icon: 'badge' },
                  { id: 'Other', th: 'โสตทัศน์ และอื่นๆ', en: 'Other / AV', icon: 'more_horiz' },
                ].map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id as TicketCategory)}
                      className={`cursor-pointer rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                        isSelected
                          ? isNeu
                            ? 'neu-pressed border border-blue-400 text-[#143ee4]'
                            : 'bg-blue-50/80 border-2 border-[#143ee4] text-[#143ee4] shadow-xs'
                          : isNeu
                          ? 'neu-button text-slate-700'
                          : 'bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#143ee4] text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {cat.icon}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[#143ee4] text-[20px]">
                            check_circle
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-headline text-xs sm:text-sm font-bold leading-tight">
                          {cat.en}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.th}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ระดับความเร่งด่วน (Priority Level) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-900">
                  ระดับความเร่งด่วน (Priority Level) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">กำหนดผลกระทบของปัญหา</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  {
                    id: 'Low',
                    th: 'Low (ต่ำ)',
                    desc: 'ปัญหาทั่วไป ไม่กระทบงานด่วน สามารถรอคิวปกติได้',
                    color: 'bg-emerald-500',
                  },
                  {
                    id: 'Medium',
                    th: 'Medium (ปานกลาง)',
                    desc: 'ทำงานได้บางส่วน มีขั้นตอนสำรองแก้ปัญหาชั่วคราว',
                    color: 'bg-amber-500',
                  },
                  {
                    id: 'High',
                    th: 'High (สูง)',
                    desc: 'กระทบต่องานหลักของแผนก จำเป็นต้องใช้งานโดยเร็ว',
                    color: 'bg-orange-500',
                  },
                  {
                    id: 'Critical',
                    th: 'Critical (วิกฤต)',
                    desc: 'ระบบหยุดชะงัก กระทบห้องเรียน/การเงิน ปฏิบัติการทันที!',
                    color: 'bg-red-500 animate-pulse',
                  },
                ].map((prio) => {
                  const isSelected = priority === prio.id;
                  return (
                    <div
                      key={prio.id}
                      onClick={() => setPriority(prio.id as TicketPriority)}
                      className={`cursor-pointer rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                        isSelected
                          ? isNeu
                            ? 'neu-pressed border border-blue-400'
                            : 'bg-blue-50/70 border-2 border-[#143ee4] shadow-xs'
                          : isNeu
                          ? 'neu-button'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${prio.color}`}></span>
                        <span
                          className={`font-headline text-xs font-bold ${
                            isSelected ? 'text-[#143ee4]' : 'text-slate-900'
                          }`}
                        >
                          {prio.th}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        {prio.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. รายละเอียดปัญหา (Problem Description) */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    description
                  </span>
                </div>
                <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                  รายละเอียดปัญหา (Problem Description)
                </h2>
              </div>
              <span className="text-xs text-red-500 font-semibold">* จำเป็นต้องระบุ</span>
            </div>

            {/* Quick Templates Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-600 block">
                แทมเพลตข้อความด่วน (คลิกเพื่อแทรก):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: 'รหัสจอฟ้า/Error Code',
                    text: '• อาการ Error / ข้อความแจ้งเตือน:\n• รหัสโค้ด: 0x0000003B (SYSTEM_SERVICE_EXCEPTION)\n• ขั้นตอนก่อนหน้า: เกิดขึ้นขณะเปิดไฟล์ Excel และทำงานค้าง',
                  },
                  {
                    label: 'ขอโปรแกรมลิขสิทธิ์',
                    text: '• ขอความอนุเคราะห์ติดตั้งซอฟต์แวร์ลิขสิทธิ์: Adobe Acrobat Pro / Microsoft 365\n• เหตุผลการใช้งาน: จัดทำรายงานประจำปีของมหาวิทยาลัย',
                  },
                  {
                    label: 'ปัญหาสาย LAN ชำรุด',
                    text: '• อาการสาย LAN: หัวคลิปล็อคหัก / สัญญาณหลุดบ่อยเมื่อขยับสาย\n• จุดติดตั้ง: หัวต่อหลังคอมพิวเตอร์ตัวหลัก',
                  },
                  {
                    label: 'ขอรีเซ็ตรหัสผ่าน',
                    text: '• ขอปลดล็อค / รีเซ็ตรหัสผ่านบัญชี:\n• บัญชีผู้ใช้งานระบบ ERP/Email:\n• เหตุผล: ใส่รหัสผ่านผิดเกินกำหนดระบบล็อค',
                  },
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertTemplate(tmpl.text)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#143ee4] text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-200/60"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#143ee4]">
                      add
                    </span>
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="กรุณาระบุขั้นตอนที่เกิดปัญหา ข้อความแจ้งเตือน (Error code) หรือสิ่งที่เกิดขึ้นก่อนเครื่องมีปัญหา เพื่อให้เจ้าหน้าที่เตรียมเครื่องมือได้ตรงจุด..."
              className={`w-full p-4 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all resize-y ${
                isNeu
                  ? 'neu-inset border-0'
                  : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              }`}
            />
          </div>

          {/* 3. แนบรูปภาพหรือเอกสารประกอบ (Attachments) */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    attach_file
                  </span>
                </div>
                <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900">
                  แนบรูปภาพหรือเอกสารประกอบ (Attachments)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">สูงสุด 4 ไฟล์ (ไม่เกิน 5 MB/ไฟล์)</span>
            </div>

            {/* Drag & Drop Zone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-[#143ee4] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/60 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#143ee4] flex items-center justify-center group-hover:scale-105 transition-transform mb-2.5">
                <span className="material-symbols-outlined text-[26px]">
                  cloud_upload
                </span>
              </div>
              <p className="font-headline text-xs sm:text-sm font-bold text-slate-800">
                ลากไฟล์มาวางที่นี่ หรือ <span className="text-[#143ee4] underline">คลิกเพื่อเลือกไฟล์</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์รูปแบบ JPG, PNG, WEBP, PDF (ขนาดไม่เกิน 5 MB ต่อไฟล์)
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded Files Preview List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">
                  ไฟล์ที่แนบแล้ว ({uploadedFiles.length} ไฟล์):
                </span>
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                        <img
                          src={f.previewUrl}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {f.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400">
                            {f.size}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px]">
                              check_circle
                            </span>
                            อัปโหลดสำเร็จ
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      title="ลบไฟล์"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Callout */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#143ee4] text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">คำแนะนำเพิ่มเติม:</span> การแนบภาพหน้าจอ Error code หรือรูปถ่ายป้ายบาร์โค้ดอุปกรณ์ที่ชำรุด จะช่วยให้เจ้าหน้าที่ไอทีสามารถวินิจฉัยและเตรียมอะไหล่สำรองเข้าหน้างานได้รวดเร็วยิ่งขึ้น
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Location, Reporter & Guidance (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. ข้อมูลสถานที่เกิดเหตุ & อุปกรณ์ */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              </div>
              <h3 className="font-headline text-base font-bold text-slate-900">
                สถานที่เกิดเหตุ & อุปกรณ์
              </h3>
            </div>

            {/* อาคาร dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">
                อาคาร / แผนกที่ตั้ง <span className="text-red-500">*</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 font-medium focus:outline-none ${
                  isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <option value="bld3-fl4-acc">อาคาร 3 ชั้น 4 แผนกบัญชีและการเงิน</option>
                <option value="bld1-fl1-reg">อาคาร 1 ชั้น 1 สำนักส่งเสริมวิชาการและทะเบียน</option>
                <option value="bld2-fl2-dean">อาคาร 2 ชั้น 2 สำนักงานคณบดี</option>
                <option value="bld4-fl5-lib">อาคารเฉลิมพระเกียรติ ชั้น 5 หอสมุดกลาง</option>
                <option value="bld-sci-fl3">อาคารปฏิบัติการวิทยาศาสตร์ ชั้น 3</option>
              </select>
            </div>

            {/* ห้อง / โต๊ะ */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">
                ห้อง / หมายเลขโต๊ะ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="ระบุห้องและตำแหน่งโต๊ะเพื่อความรวดเร็ว"
                className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 focus:outline-none ${
                  isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
                }`}
              />
            </div>

            {/* รหัสครุภัณฑ์ */}
            <div className="space-y-1">
              <label className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>รหัสครุภัณฑ์ / Asset Tag</span>
                <span className="text-[11px] text-slate-400 font-normal">ถ้ามี</span>
              </label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="เช่น PC-ACC-2022-019"
                className={`w-full h-10 px-3 rounded-xl font-mono text-xs text-slate-800 focus:outline-none uppercase ${
                  isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
                }`}
              />
              <p className="text-[11px] text-slate-400">
                ดูสติ๊กเกอร์สีเงิน/บาร์โค้ดบนเคสคอมพิวเตอร์หรือหลังจอ
              </p>
            </div>
          </div>

          {/* 2. ข้อมูลผู้แจ้ง (Reporter Details with Privacy Masking) */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <h3 className="font-headline text-base font-bold text-slate-900">
                  ข้อมูลผู้แจ้ง
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                อัตโนมัติจาก SSO
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {currentUser.department}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    mail
                  </span>
                  อีเมล
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {currentUser.email}
                </span>
              </div>

              {/* Phone with Mask toggle */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    call
                  </span>
                  เบอร์มือถือ
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900">
                    {maskedPhone
                      ? currentUser.phone.replace(/(\d{3})-\d{3}-(\d{4})/, '$1-XXX-$2')
                      : currentUser.phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMaskedPhone(!maskedPhone)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                    title="สลับการซ่อนข้อมูล PDPA"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {maskedPhone ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Campus */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    phone_in_talk
                  </span>
                  เบอร์ต่อภายใน
                </span>
                <span className="font-mono font-bold text-slate-900">4402</span>
              </div>
            </div>
          </div>

          {/* 3. คำแนะนำและข้อควรปฏิบัติ */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              </div>
              <h3 className="font-headline text-base font-bold text-slate-900">
                ข้อควรปฏิบัติเบื้องต้น
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                  check_circle
                </span>
                <span>ตรวจสอบสายปลั๊กไฟ สายสัญญาณจอ และสวิตช์เปิดเครื่อง</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                  check_circle
                </span>
                <span>บันทึกภาพหน้าจอ Error code หรือถ่ายรูปอาการที่เกิดขึ้น</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                  check_circle
                </span>
                <span>จดหมายเลขเครื่อง (Asset Tag) เพื่อความรวดเร็วในการติดตาม</span>
              </li>
            </ul>

            {/* Hotline */}
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">
                  e911_emergency
                </span>
                <span>เหตุด่วนฉุกเฉินระดับวิกฤต</span>
              </div>
              <p className="text-[11px] text-slate-600">
                หากระบบห้องประชุมใหญ่หรือเซิร์ฟเวอร์หลักหยุดชะงัก ติดต่อสายตรงศูนย์ไอที:
              </p>
              <div className="font-mono font-bold text-xs text-red-700 bg-white p-2 rounded-lg border border-red-200 text-center">
                02-613-3999 ต่อ 999
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS BAR (Full Width inside Form) */}
        <div className={`lg:col-span-12 ${cardCls} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>ล้างข้อมูล (Reset)</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>บันทึกแบบร่าง (Save Draft)</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>ยืนยันและส่งใบแจ้งซ่อม (Submit Ticket)</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-12 text-center pb-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">
            verified_user
          </span>
          <span>เมื่อกดยืนยัน ระบบจะสร้างหมายเลข Ticket อัตโนมัติ และส่งข้อความแจ้งเตือนเจ้าหน้าที่ไอทีทันที</span>
        </div>
      </form>
    </div>
  );
};
