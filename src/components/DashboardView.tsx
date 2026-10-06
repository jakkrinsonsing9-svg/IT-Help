import React, { useState } from 'react';
import { Ticket, Technician, AppTheme, ActiveView, TicketCategory } from '../types';

interface DashboardViewProps {
  tickets: Ticket[];
  technicians: Technician[];
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onClaimTicket: (ticketId: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  technicians,
  theme,
  onNavigate,
  onClaimTicket,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';
  const [timeRange, setTimeRange] = useState('รอบเดือนปัจจุบัน (ต.ค. 2567)');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      author: 'ช่างวรวิทย์ (IT-04)',
      time: '2 นาทีที่แล้ว',
      text: 'กำลังเปลี่ยนหัวสายสัญญาณ HDMI และทดสอบภาพออกโปรเจกเตอร์ห้อง 201 อาคารเรียนรวม',
      ticketRef: 'TK-2024-0888',
      type: 'comment',
      icon: 'chat',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'act-2',
      author: 'ช่างธนกร (IT-02)',
      time: '18 นาทีที่แล้ว',
      text: 'เปลี่ยนสถานะงานเป็น [แก้ไขเสร็จแล้ว] : แก้ไขการแชร์ไดรฟ์แผนกบุคคลเรียบร้อย',
      ticketRef: 'TK-2024-0865',
      type: 'resolved',
      icon: 'check_circle',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'act-3',
      author: 'หัวหน้าศูนย์สารสนเทศ',
      time: '42 นาทีที่แล้ว',
      text: 'มอบหมายงานตรวจสอบอุปกรณ์กระจายสัญญาณ Wi-Fi ชั้น 3 ให้กับ ช่างณัฐพล',
      ticketRef: 'TK-2024-0870',
      type: 'assigned',
      icon: 'person_add',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'act-4',
      author: 'ช่างกิตติศักดิ์ (IT-09)',
      time: '1 ชม. ที่แล้ว',
      text: 'ขอรหัสครุภัณฑ์เพิ่มเติมจากผู้แจ้งซ่อมเครื่องพิมพ์เลเซอร์ คณะบริหารธุรกิจ',
      ticketRef: 'TK-2024-0872',
      type: 'waiting',
      icon: 'help',
      color: 'text-purple-600 bg-purple-50',
    },
  ]);

  // Derived counts
  const totalCount = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const acceptedCount = tickets.filter((t) => t.status === 'Accepted').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const waitingCount = tickets.filter((t) => t.status === 'Waiting').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const closedCount = tickets.filter((t) => t.status === 'Closed').length;

  // Category counts
  const catCompCount = tickets.filter((t) => t.category === 'Computer').length;
  const catNetCount = tickets.filter((t) => t.category === 'Network').length;
  const catSoftCount = tickets.filter((t) => t.category === 'Software').length;
  const catPrintCount = tickets.filter((t) => t.category === 'Printer').length;
  const catAccCount = tickets.filter((t) => t.category === 'Account').length;
  const catOtherCount = tickets.filter((t) => t.category === 'Other').length;

  const getCatPct = (c: number) => (totalCount > 0 ? Math.round((c / totalCount) * 100) : 0);

  // Urgent tickets for table (Critical or High)
  const urgentTickets = tickets.filter(
    (t) => t.priority === 'Critical' || t.priority === 'High'
  ).slice(0, 5);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('อัปเดตเรียบร้อย', 'ดึงข้อมูลสถานะและสรุปผลล่าสุดเรียบร้อยแล้ว', 'success');
    }, 600);
  };

  const handlePostQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) {
      onShowToast('แจ้งเตือน', 'กรุณากรอกข้อความเพื่อส่งบันทึกเวียน', 'error');
      return;
    }
    const newAct = {
      id: 'act-' + Date.now(),
      author: 'สมชาย ศรีสุวรรณ (แอดมิน)',
      time: 'เมื่อสักครู่',
      text: quickNote.trim(),
      ticketRef: 'ประกาศทั่วไป',
      type: 'comment',
      icon: 'campaign',
      color: 'text-blue-600 bg-blue-50',
    };
    setActivities([newAct, ...activities]);
    onShowToast('ส่งข้อความสำเร็จ', `ส่งข้อความแจ้งเวียน: "${quickNote.trim()}" สำเร็จแล้ว`, 'success');
    setQuickNote('');
  };

  const handleExportPDF = () => {
    onShowToast('ส่งออกเอกสาร', 'ระบบกำลังสร้างรายงานสรุปประจำวัน (PDF) โปรดรอสักครู่...', 'info');
    setTimeout(() => {
      onShowToast('ดาวน์โหลดสำเร็จ', 'สร้างรายงาน daily-it-report-20241024.pdf เรียบร้อย', 'success');
    }, 1200);
  };

  // Card base style
  const cardCls = isNeu
    ? 'neu-card p-5'
    : 'bg-white rounded-2xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Action / Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#143ee4] animate-pulse"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ระบบติดตามและสนับสนุนเทคโนโลยีสารสนเทศ
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            ภาพรวมการให้บริการและแจ้งซ่อม IT ประจำวัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            อัปเดตข้อมูลอัตโนมัติทุก 1 นาที • วิทยาเขตหลัก ประจำวันที่ 24 ตุลาคม 2567
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Time range select */}
          <div
            className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold ${
              isNeu
                ? 'neu-inset text-slate-800'
                : 'bg-slate-100 border border-slate-200/80 text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400 mr-1.5">
              calendar_today
            </span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-2 font-medium"
            >
              <option>รอบเดือนปัจจุบัน (ต.ค. 2567)</option>
              <option>รอบสัปดาห์นี้</option>
              <option>วันนี้ (24 ต.ค. 2567)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 transition-all ${
              isNeu
                ? 'neu-button'
                : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-xs'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] text-[#143ee4] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>รีเฟรชข้อมูล</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              isNeu
                ? 'neu-primary-button'
                : 'bg-[#143ee4] hover:bg-[#1034bf]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>ส่งออกรายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Status Cards (7 Categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-3.5">
        {/* Total Tickets */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-blue-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">งานทั้งหมด</span>
            <span className="material-symbols-outlined text-[#143ee4] text-[20px]">
              layers
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-2xl lg:text-3xl font-extrabold text-slate-900">
              {totalCount}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[#143ee4] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">
                {totalCount > 0 ? 'trending_up' : 'check_circle'}
              </span>
              <span>{totalCount > 0 ? `${totalCount} รายการในระบบ` : 'ไม่มีงานค้างในระบบ'}</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">รอดำเนินการ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-amber-700">
                {pendingCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                รอจ่ายงาน {tickets.filter((t) => t.status === 'Pending' && !t.assignedTech).length} รายการ
              </span>
            </div>
          </div>
        </div>

        {/* Accepted */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-cyan-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">รับเรื่องแล้ว</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-xs"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-cyan-800">
                {acceptedCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800">
                มอบหมายแล้ว
              </span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-blue-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">กำลังดำเนินการ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#143ee4] shadow-xs"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-[#143ee4]">
                {inProgressCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#143ee4]">
                ช่างกำลังซ่อม
              </span>
            </div>
          </div>
        </div>

        {/* Waiting for User */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-purple-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">รอข้อมูลผู้แจ้ง</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-purple-800">
                {waitingCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800">
                ส่งอีเมลแจ้งแล้ว
              </span>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-emerald-400 transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">แก้ไขเสร็จแล้ว</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-emerald-700">
                {resolvedCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                รอตรวจรับ
              </span>
            </div>
          </div>
        </div>

        {/* Closed */}
        <div
          onClick={() => onNavigate('all-tickets')}
          className={`${cardCls} cursor-pointer hover:border-slate-400 transition-all flex flex-col justify-between col-span-2 sm:col-span-1`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ปิดงานสมบูรณ์</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-2xl lg:text-3xl font-extrabold text-slate-700">
                {closedCount}
              </span>
              <span className="text-xs text-slate-400">ใบงาน</span>
            </div>
            <div className="mt-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                เรียบร้อย 100%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Performance Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SLA Rate */}
        <div className={`${cardCls} flex items-center justify-between relative overflow-hidden`}>
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">verified</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                อัตราการแก้ปัญหาตรงเวลา (SLA)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-headline text-2xl font-bold text-slate-900">
                  94.8%
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  +1.2% เหนือเป้าหมาย
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เป้าหมายองค์กรกำหนดไว้ที่ 92.0%
              </p>
            </div>
          </div>
          {/* Circular Progress Ring */}
          <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-[#143ee4]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="94.8, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-mono text-[11px] font-bold text-[#143ee4]">
              94.8%
            </span>
          </div>
        </div>

        {/* MTTA */}
        <div className={`${cardCls} flex items-center justify-between relative overflow-hidden`}>
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">timer</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                เวลาเฉลี่ยในการตอบกลับแรก
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-headline text-2xl font-bold text-slate-900">
                  18 นาที
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  เร็วกว่าเกณฑ์ 12 น.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดมาตรฐานตอบรับภายใน 30 นาที
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="w-14 h-6 flex items-end gap-1">
              <span className="w-2.5 h-3 bg-cyan-200 rounded-t"></span>
              <span className="w-2.5 h-4 bg-cyan-300 rounded-t"></span>
              <span className="w-2.5 h-6 bg-cyan-600 rounded-t"></span>
              <span className="w-2.5 h-5 bg-cyan-400 rounded-t"></span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 font-mono">avg 18m</span>
          </div>
        </div>

        {/* CSAT */}
        <div className={`${cardCls} flex items-center justify-between relative overflow-hidden`}>
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">star</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                ความพึงพอใจการบริการ (CSAT)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-headline text-2xl font-bold text-slate-900">
                  4.8
                </span>
                <span className="text-base text-slate-400 font-normal">/ 5.0</span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  ดีเยี่ยม
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ประเมินจากแบบสำรวจ 86 ใบงาน
              </p>
            </div>
          </div>
          <div className="flex items-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Category Breakdown (7 cols) */}
        <div className={`lg:col-span-7 ${cardCls} flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-slate-900">
                สถิติการแจ้งซ่อมแยกตามหมวดหมู่
              </h2>
              <p className="text-xs text-slate-500">
                สัดส่วนและปริมาณงานจำแนกตามประเภทปัญหา IT ทั้ง 6 กลุ่ม
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              รวม {totalCount} งาน
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-1">
            {/* Item 1: Computer */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                    computer
                  </span>
                  <span>คอมพิวเตอร์ & ฮาร์ดแวร์</span>
                </div>
                <span className="font-mono text-[#143ee4] font-bold">
                  {catCompCount} งาน ({getCatPct(catCompCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-[#143ee4] h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catCompCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Item 2: Network */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-cyan-600">
                    wifi
                  </span>
                  <span>เครือข่าย & อินเทอร์เน็ต</span>
                </div>
                <span className="font-mono text-cyan-700 font-bold">
                  {catNetCount} งาน ({getCatPct(catNetCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catNetCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Item 3: Software */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-indigo-600">
                    terminal
                  </span>
                  <span>ซอฟต์แวร์ & โปรแกรม</span>
                </div>
                <span className="font-mono text-indigo-700 font-bold">
                  {catSoftCount} งาน ({getCatPct(catSoftCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catSoftCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Item 4: Printer */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">
                    print
                  </span>
                  <span>เครื่องพิมพ์ & สแกนเนอร์</span>
                </div>
                <span className="font-mono text-amber-700 font-bold">
                  {catPrintCount} งาน ({getCatPct(catPrintCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catPrintCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Item 5: Account */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    badge
                  </span>
                  <span>บัญชีผู้ใช้ & สิทธิ์เข้าระบบ</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">
                  {catAccCount} งาน ({getCatPct(catAccCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catAccCount)}%` }}
                ></div>
              </div>
            </div>

            {/* Item 6: Other */}
            <div
              onClick={() => onNavigate('all-tickets')}
              className="bg-slate-50/80 hover:bg-slate-100 p-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    devices_other
                  </span>
                  <span>อื่นๆ / โสตทัศนูปกรณ์</span>
                </div>
                <span className="font-mono text-slate-600 font-bold">
                  {catOtherCount} งาน ({getCatPct(catOtherCount)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all"
                  style={{ width: `${getCatPct(catOtherCount)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-slate-400 text-xs border-t border-slate-100 mt-2">
            <span>เกณฑ์การจัดสรรช่าง: ปัญหาเครือข่ายและความมั่นคงปลอดภัยจัดอยู่ในลำดับความสำคัญสูงสุด</span>
            <button
              onClick={() => onNavigate('all-tickets')}
              className="text-[#143ee4] font-semibold hover:underline flex items-center gap-0.5"
            >
              ดูตารางแจกแจง <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Weekly Trend Visual (5 cols) */}
        <div className={`lg:col-span-5 ${cardCls} flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-slate-900">
                แนวโน้มงานรอบ 7 วันที่ผ่านมา
              </h2>
              <p className="text-xs text-slate-500">
                เปรียบเทียบงานที่แจ้งเข้า vs งานที่ปิดสำเร็จ
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#143ee4] rounded-full"></span> แจ้งเข้า
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> ปิดงาน
              </span>
            </div>
          </div>

          {/* Weekly Bar Chart Illustration */}
          <div className="h-48 w-full mt-4 flex items-end justify-between gap-2 px-1">
            {/* Mon */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="font-mono text-[10px] text-slate-400 font-bold">22</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-[#143ee4] rounded-t" style={{ height: '85%' }}></div>
                <div className="w-1/2 bg-emerald-500 rounded-t" style={{ height: '70%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">จันทร์</span>
            </div>
            {/* Tue */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="font-mono text-[10px] text-slate-400 font-bold">18</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-[#143ee4] rounded-t" style={{ height: '65%' }}></div>
                <div className="w-1/2 bg-emerald-500 rounded-t" style={{ height: '60%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">อังคาร</span>
            </div>
            {/* Wed */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="font-mono text-[10px] text-slate-400 font-bold">28</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-[#143ee4] rounded-t" style={{ height: '98%' }}></div>
                <div className="w-1/2 bg-emerald-500 rounded-t" style={{ height: '85%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">พุธ</span>
            </div>
            {/* Thu (Today) */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
              <span className="font-mono text-[10px] text-[#143ee4] font-bold">25</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36 bg-blue-50/70 rounded-t p-0.5">
                <div className="w-1/2 bg-[#143ee4] rounded-t" style={{ height: '88%' }}></div>
                <div className="w-1/2 bg-emerald-500 rounded-t" style={{ height: '50%' }}></div>
              </div>
              <span className="text-[11px] text-[#143ee4] font-bold">พฤ (วันนี้)</span>
            </div>
            {/* Fri */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end opacity-40">
              <span className="font-mono text-[10px] text-slate-400 font-bold">-</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">ศุกร์</span>
            </div>
            {/* Sat */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end opacity-40">
              <span className="font-mono text-[10px] text-slate-400 font-bold">-</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">เสาร์</span>
            </div>
            {/* Sun */}
            <div className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end opacity-40">
              <span className="font-mono text-[10px] text-slate-400 font-bold">-</span>
              <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 h-36">
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
                <div className="w-1/2 bg-slate-200 rounded-t" style={{ height: '10%' }}></div>
              </div>
              <span className="text-[11px] text-slate-500">อาทิตย์</span>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-slate-700 font-medium">
              สถิติสูงสุด: วันพุธที่ผ่านมา (28 รายการ ปิดงานได้ 24 รายการ)
            </span>
            <span className="font-mono text-emerald-700 font-bold">85.7% สำเร็จ</span>
          </div>
        </div>
      </div>

      {/* Dual Layout: Urgent Tickets Queue & Live Tech Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Urgent & High Priority Tickets Table (8 cols) */}
        <div className={`xl:col-span-8 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[22px]">
                    warning
                  </span>
                  <h2 className="font-headline text-lg font-bold text-slate-900">
                    ตารางงานด่วนที่ต้องดำเนินการทันที
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  แสดงงานระดับ Critical และ High ที่ยังไม่ได้รับการแก้ไข หรือกำลังเร่งแก้ปัญหา
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200/60">
                  ด่วนวิกฤต {urgentTickets.filter((t) => t.priority === 'Critical').length} รายการ
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 rounded-l-lg">รหัสใบงาน</th>
                    <th className="py-2.5 px-3">ผู้แจ้ง / ติดต่อ</th>
                    <th className="py-2.5 px-3">รายละเอียดปัญหา & สถานที่</th>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-3">ระดับ</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">จัดการด่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {urgentTickets.map((t) => {
                    const isClaimedByMe = t.assignedTech === 'สมชาย ศรีสุวรรณ';
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => onNavigate('ticket-detail', t.id)}
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#143ee4]">
                            #{t.id}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {t.createdAtRelative}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">
                            {t.requesterName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">phone</span>
                            {t.requesterPhone.replace(/(\d{3})-\d{3}-(\d{4})/, '$1-XXX-$2')}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[220px]">
                          <span className="font-medium text-slate-800 block truncate">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">
                              location_on
                            </span>
                            {t.location}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              t.priority === 'Critical'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                              t.status === 'In Progress'
                                ? 'bg-blue-100 text-[#143ee4]'
                                : t.status === 'Accepted'
                                ? 'bg-cyan-100 text-cyan-800'
                                : t.status === 'Waiting'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {t.status === 'In Progress'
                              ? 'กำลังดำเนินการ'
                              : t.status === 'Accepted'
                              ? 'รับเรื่องแล้ว'
                              : t.status === 'Waiting'
                              ? 'รอข้อมูลผู้แจ้ง'
                              : 'รอดำเนินการ'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {!t.assignedTech ? (
                              <button
                                onClick={() => onClaimTicket(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#143ee4] hover:bg-[#1034bf] text-white font-semibold text-xs shadow-xs transition-colors"
                              >
                                รับงาน
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium px-1">
                                {isClaimedByMe ? 'คุณดูแล' : t.assignedTech.split(' ')[0]}
                              </span>
                            )}
                            <button
                              onClick={() => onNavigate('ticket-detail', t.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="ดูรายละเอียด"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                visibility
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {urgentTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-emerald-500">
                          task_alt
                        </span>
                        <p className="font-bold text-slate-700 text-sm">ไม่มีรายการงานด่วนค้างอยู่ในระบบ</p>
                        <p className="text-xs text-slate-400 mt-1">ทุกรายการได้รับการจัดการเรียบร้อย หรือยังไม่มีการแจ้งซ่อมใหม่</p>
                        <button
                          onClick={() => onNavigate('new-ticket')}
                          className="mt-3.5 px-4 py-2 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>สร้างใบแจ้งซ่อมใหม่</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              แสดง {urgentTickets.length} จากทั้งหมด {tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High').length} รายการด่วน
            </span>
            <button
              onClick={() => onNavigate('all-tickets')}
              className="text-[#143ee4] font-semibold hover:underline flex items-center gap-1"
            >
              ดูงานด่วนทั้งหมดในคิว
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Live Activity Feed of Technicians (4 cols) */}
        <div className={`xl:col-span-4 ${cardCls} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="font-headline text-lg font-bold text-slate-900">
                  กิจกรรมล่าสุดของทีมช่าง
                </h2>
              </div>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                เรียลไทม์
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              การบันทึกสถานะ การตรวจสอบหน้างาน และความคืบหน้า
            </p>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-3.5">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>

              {activities.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                    <span className="material-symbols-outlined text-[12px]">
                      {act.icon}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl w-full text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.author}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 leading-relaxed">{act.text}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] text-[#143ee4] font-semibold">
                      อ้างอิง #{act.ticketRef}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Post Admin Note Box */}
          <form onSubmit={handlePostQuickNote} className="mt-4 pt-3 bg-slate-50 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-[#143ee4]">
                edit_note
              </span>
              <span className="text-xs font-bold text-slate-800">
                แจ้งเวียนด่วนถึงทีมช่างเวร
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="พิมพ์ข้อความด่วนส่งเข้าไลน์กลุ่มทีมช่าง..."
                className="w-full bg-white px-3 py-1.5 rounded-lg text-xs text-slate-900 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-xs"
              />
              <button
                type="submit"
                className="bg-[#143ee4] hover:bg-[#1034bf] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs"
              >
                ส่ง
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* On-Duty Technicians Snapshot Grid */}
      <div className={cardCls}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-slate-900">
              สถานะความพร้อมเจ้าหน้าที่ประจำกะ (On-Duty Roster)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เจ้าหน้าที่พร้อมปฏิบัติการ {technicians.length} คน • กำลังลงพื้นที่ซ่อม 3 คน • สแตนด์บายที่ศูนย์คอม 3 คน
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-2">
            <span className="text-xs text-slate-400">กะการทำงาน: 08:30 - 16:30 น.</span>
            <button
              onClick={() => onNavigate('users')}
              className="text-xs font-bold text-[#143ee4] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              จัดตารางเวร
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-xl flex items-center gap-3 transition-colors border border-slate-100"
            >
              <div className="relative shrink-0">
                <img
                  src={tech.avatar}
                  alt={tech.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                    tech.status === 'available'
                      ? 'bg-emerald-500'
                      : tech.status === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  title={tech.status === 'available' ? 'พร้อมรับงาน' : 'ติดสาย/ซ่อม'}
                ></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {tech.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      tech.activeLoad === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tech.activeLoad === 0 ? 'ว่างรับงาน' : `${tech.activeLoad} งานค้าง`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                  {tech.role}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block truncate">
                  {tech.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
