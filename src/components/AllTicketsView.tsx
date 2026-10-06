import React, { useState, useMemo } from 'react';
import {
  Ticket,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  AppTheme,
  ActiveView,
} from '../types';

interface AllTicketsViewProps {
  tickets: Ticket[];
  currentUser?: UserProfile;
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onClaimTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onClearAllTickets?: () => void;
  onLoadSampleTickets?: () => void;
}

export const AllTicketsView: React.FC<AllTicketsViewProps> = ({
  tickets,
  currentUser,
  theme,
  onNavigate,
  onClaimTicket,
  onUpdateStatus,
  onShowToast,
  onClearAllTickets,
  onLoadSampleTickets,
}) => {
  const isNeu = theme === 'neumorphic';
  const isAdmin = currentUser?.role === 'admin';
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('');
  const [prioFilter, setPrioFilter] = useState<string>('');
  const [techFilter, setTechFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-25');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.requesterName.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !statusFilter || t.status === statusFilter;
      const matchCat = !catFilter || t.category === catFilter;
      const matchPrio = !prioFilter || t.priority === prioFilter;
      const matchTech =
        !techFilter ||
        (techFilter === 'unassigned'
          ? !t.assignedTech
          : t.assignedTech?.includes(techFilter));

      return matchSearch && matchStatus && matchCat && matchPrio && matchTech;
    });
  }, [tickets, search, statusFilter, catFilter, prioFilter, techFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCatFilter('');
    setPrioFilter('');
    setTechFilter('');
    onShowToast('ล้างตัวกรอง', 'รีเซ็ตค่าค้นหาและการคัดกรองทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  const handleExport = (type: 'Excel' | 'PDF') => {
    onShowToast(
      `ส่งออกข้อมูล ${type}`,
      `ระบบกำลังประมวลผลไฟล์สรุปรายการใบแจ้งซ่อม (${type}) โปรดรอสักครู่...`,
      'info'
    );
    setTimeout(() => {
      onShowToast(
        'ส่งออกสำเร็จ',
        `ดาวน์โหลดไฟล์ all-tickets-report.${type === 'Excel' ? 'xlsx' : 'pdf'} เรียบร้อยแล้ว`,
        'success'
      );
    }, 1200);
  };

  const togglePhoneMask = (id: string) => {
    setUnmaskedPhones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const cardCls = isNeu
    ? 'neu-card p-5'
    : 'bg-white rounded-2xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  // Summary counts
  const totalCount = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const unassignedPending = tickets.filter(
    (t) => t.status === 'Pending' && !t.assignedTech
  ).length;
  const inProgressCount = tickets.filter(
    (t) => t.status === 'In Progress' || t.status === 'Accepted'
  ).length;
  const urgentCount = tickets.filter(
    (t) =>
      (t.priority === 'High' || t.priority === 'Critical') &&
      (t.status === 'In Progress' || t.status === 'Accepted')
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Operations Summary Header (4 Asymmetric metric cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardCls} flex items-center justify-between`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              งานทั้งหมดในระบบ
            </span>
            <h2 className="font-headline text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1">
              {totalCount}
            </h2>
            <span className="text-xs text-[#143ee4] flex items-center gap-1 mt-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">
                {totalCount > 0 ? 'trending_up' : 'info'}
              </span>
              <span>{totalCount > 0 ? `${totalCount} รายการในฐานข้อมูล` : 'พร้อมรับข้อมูลใหม่'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#143ee4] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">inbox</span>
          </div>
        </div>

        <div className={`${cardCls} flex items-center justify-between`}>
          <div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
              รอดำเนินการ (PENDING)
            </span>
            <h2 className="font-headline text-2xl lg:text-3xl font-extrabold text-red-600 mt-1">
              {pendingCount}
            </h2>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
              ยังไม่ได้มอบหมาย {unassignedPending} รายการ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
        </div>

        <div className={`${cardCls} flex items-center justify-between`}>
          <div>
            <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
              กำลังดำเนินการ (IN PROGRESS)
            </span>
            <h2 className="font-headline text-2xl lg:text-3xl font-extrabold text-cyan-800 mt-1">
              {inProgressCount}
            </h2>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
              ความเร่งด่วนสูง {urgentCount} รายการ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">engineering</span>
          </div>
        </div>

        <div className={`${cardCls} flex items-center justify-between`}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              แก้ไขเสร็จสิ้น / ปิดงาน
            </span>
            <h2 className="font-headline text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1">
              {resolvedCount}
            </h2>
            <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {totalCount > 0 ? `ปิดงานแล้ว ${Math.round((resolvedCount / totalCount) * 100)}%` : 'สถานะปกติ'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">task_alt</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter & Search Module */}
      <div className={`${cardCls} space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-slate-900">
              จัดการใบแจ้งซ่อมทั้งหมด (All Tickets)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              คัดกรอง ค้นหา มอบหมายเจ้าหน้าที่ และปรับเปลี่ยนสถานะใบงานบริการเทคโนโลยีสารสนเทศ
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {isAdmin && onClearAllTickets && tickets.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isNeu
                    ? 'neu-button text-rose-600'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
                title="ล้างข้อมูลตัวอย่างออกจากระบบ (เฉพาะแอดมิน)"
              >
                <span className="material-symbols-outlined text-[18px] text-rose-600">
                  delete_sweep
                </span>
                <span>ล้างข้อมูลตัวอย่าง</span>
              </button>
            )}

            <button
              onClick={() => handleExport('Excel')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isNeu
                  ? 'neu-button text-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                table_view
              </span>
              <span>ส่งออก Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isNeu
                  ? 'neu-button text-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-red-600">
                picture_as_pdf
              </span>
              <span>ส่งออก PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
          {/* Search Field */}
          <div className="lg:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="รหัส Ticket, ชื่อผู้แจ้ง, อาคาร หรือหัวข้อปัญหา..."
              className={`w-full h-10 pl-9 pr-3 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                isNeu
                  ? 'neu-inset border-0'
                  : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 font-medium focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <option value="">สถานะ: ทั้งหมด</option>
              <option value="Pending">Pending (รอดำเนินการ)</option>
              <option value="Accepted">Accepted (รับเรื่องแล้ว)</option>
              <option value="In Progress">In Progress (กำลังทำ)</option>
              <option value="Waiting">Waiting (รอข้อมูล/อะไหล่)</option>
              <option value="Resolved">Resolved (แก้ไขแล้ว)</option>
              <option value="Closed">Closed (ปิดงานแล้ว)</option>
              <option value="Cancelled">Cancelled (ยกเลิก)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 font-medium focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <option value="">หมวดหมู่: ทั้งหมด</option>
              <option value="Computer">Computer (คอมพิวเตอร์)</option>
              <option value="Network">Network (ระบบเครือข่าย)</option>
              <option value="Software">Software (ซอฟต์แวร์)</option>
              <option value="Printer">Printer (เครื่องพิมพ์)</option>
              <option value="Account">Account (บัญชีผู้ใช้)</option>
              <option value="Other">Other (อื่นๆ)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              value={prioFilter}
              onChange={(e) => setPrioFilter(e.target.value)}
              className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 font-medium focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <option value="">ความเร่งด่วน: ทั้งหมด</option>
              <option value="Critical">Critical (วิกฤต)</option>
              <option value="High">High (สูง)</option>
              <option value="Medium">Medium (ปานกลาง)</option>
              <option value="Low">Low (ต่ำ)</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div className="lg:col-span-2">
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className={`w-full h-10 px-3 rounded-xl text-xs text-slate-800 font-medium focus:outline-none ${
                isNeu ? 'neu-inset border-0' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <option value="">ช่าง: ทั้งหมด</option>
              <option value="unassigned">ยังไม่ได้มอบหมาย</option>
              <option value="สมชาย ศรีสุวรรณ">สมชาย ศรีสุวรรณ (ตัวคุณ)</option>
              <option value="วรวิทย์ ยิ่งยง">วรวิทย์ ยิ่งยง</option>
              <option value="กานดา นวลสว่าง">กานดา นวลสว่าง</option>
              <option value="ธนกร ภัทรเดช">ธนกร ภัทรเดช</option>
              <option value="ณัฐพล สดใส">ณัฐพล สดใส</option>
            </select>
          </div>
        </div>

        {/* Date Range & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                calendar_today
              </span>
              <span>ช่วงวันที่:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-mono text-slate-900 focus:outline-none"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-mono text-slate-900 focus:outline-none"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              ล้างตัวกรอง
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            พบผลลัพธ์: <strong className="text-[#143ee4] font-bold">{filteredTickets.length}</strong> จาก {tickets.length} รายการ
          </div>
        </div>
      </div>

      {/* Main Ticket Table Module */}
      <div className={`${cardCls} overflow-hidden p-0!`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4">TICKET ID</th>
                <th className="py-3.5 px-4">วันที่แจ้ง</th>
                <th className="py-3.5 px-4">ข้อมูลผู้แจ้ง (Data Masking)</th>
                <th className="py-3.5 px-4 min-w-[220px]">หัวข้อปัญหา & รายละเอียด</th>
                <th className="py-3.5 px-3">หมวดหมู่</th>
                <th className="py-3.5 px-3">ความเร่งด่วน</th>
                <th className="py-3.5 px-3">สถานะ</th>
                <th className="py-3.5 px-4">ช่างผู้รับผิดชอบ</th>
                <th className="py-3.5 px-4 text-right">การกระทำ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => {
                const isMasked = !unmaskedPhones[t.id];
                const displayPhone = isMasked
                  ? t.requesterPhone.replace(/(\d{3})-\d{3}-(\d{4})/, '$1-XXX-$2')
                  : t.requesterPhone;

                const isClaimedByMe = t.assignedTech === 'สมชาย ศรีสุวรรณ';
                const isMenuOpen = activeMenuId === t.id;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => onNavigate('ticket-detail', t.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#143ee4]">
                      #{t.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      <span>{t.createdAt.split(' • ')[0]}</span>
                      <span className="block text-[11px] text-slate-400">
                        {t.createdAt.split(' • ')[1] || t.createdAtRelative}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.requesterName}</div>
                      <div className="text-[11px] text-slate-400">{t.requesterDept}</div>
                      <div
                        className="font-mono text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 cursor-pointer hover:text-[#143ee4]"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhoneMask(t.id);
                        }}
                        title={isMasked ? 'คลิกเพื่อดูเบอร์เต็ม' : 'คลิกเพื่อซ่อนเบอร์'}
                      >
                        <span className="material-symbols-outlined text-[13px] text-cyan-700">
                          call
                        </span>
                        <span>{displayPhone}</span>
                        <span className="material-symbols-outlined text-[12px] text-slate-400">
                          {isMasked ? 'visibility' : 'visibility_off'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div className="font-semibold text-slate-900 truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {t.location} • {t.roomDetails}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          t.priority === 'Critical'
                            ? 'bg-red-500 text-white animate-pulse'
                            : t.priority === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          t.status === 'In Progress'
                            ? 'bg-blue-100 text-[#143ee4]'
                            : t.status === 'Accepted'
                            ? 'bg-cyan-100 text-cyan-800'
                            : t.status === 'Waiting'
                            ? 'bg-purple-100 text-purple-800'
                            : t.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Closed'
                            ? 'bg-slate-100 text-slate-700'
                            : t.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.assignedTech ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#143ee4] flex items-center justify-center font-bold text-[11px]">
                            {t.assignedTech.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 truncate">
                            {isClaimedByMe ? `${t.assignedTech} (คุณ)` : t.assignedTech}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 italic text-[11px]">
                          ยังไม่มีผู้รับผิดชอบ
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1.5 relative">
                        {!t.assignedTech && isAdmin && (
                          <button
                            onClick={() => onClaimTicket(t.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#143ee4] hover:bg-[#1034bf] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              touch_app
                            </span>
                            <span>รับงาน</span>
                          </button>
                        )}

                        {/* Status Change Dropdown (Admin only) */}
                        {isAdmin && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setActiveMenuId(isMenuOpen ? null : t.id)
                              }
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="เปลี่ยนสถานะ"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                tune
                              </span>
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl z-30 py-1 border border-slate-200 text-left animate-in fade-in-50 zoom-in-95">
                                <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase">
                                  ปรับเปลี่ยนสถานะ
                                </div>
                                {(
                                  [
                                    'Accepted',
                                    'In Progress',
                                    'Waiting',
                                    'Resolved',
                                    'Closed',
                                  ] as TicketStatus[]
                                ).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      onUpdateStatus(t.id, s);
                                      setActiveMenuId(null);
                                      onShowToast(
                                        'ปรับปรุงสถานะสำเร็จ',
                                        `เปลี่ยนสถานะ #${t.id} เป็น '${s}' เรียบร้อยแล้ว`,
                                        'success'
                                      );
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 text-slate-800 font-medium ${
                                      t.status === s ? 'text-[#143ee4] font-bold bg-blue-50/50' : ''
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Detail button */}
                        <button
                          onClick={() => onNavigate('ticket-detail', t.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="ดูรายละเอียดใบงาน"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <span className="material-symbols-outlined text-5xl block mb-2 text-slate-300">
                      {tickets.length === 0 ? 'inbox' : 'search_off'}
                    </span>
                    <h3 className="font-bold text-slate-700 text-sm">
                      {tickets.length === 0
                        ? 'ยังไม่มีข้อมูลใบแจ้งซ่อมในระบบ'
                        : 'ไม่พบใบแจ้งซ่อมที่ตรงกับเงื่อนไขการค้นหา'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {tickets.length === 0
                        ? 'ข้อมูลตัวอย่างถูกล้างออกแล้ว คุณสามารถเริ่มสร้างใบแจ้งซ่อมจริงได้ทันที'
                        : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่และสถานะ'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      {tickets.length === 0 ? (
                        <>
                          <button
                            onClick={() => onNavigate('new-ticket')}
                            className="px-4 py-2 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            <span>+ สร้างใบแจ้งซ่อมใหม่ (New Ticket)</span>
                          </button>
                          {onLoadSampleTickets && (
                            <button
                              onClick={onLoadSampleTickets}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              <span>โหลดข้อมูลตัวอย่างกลับมา</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={handleResetFilters}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                          <span>ล้างตัวกรองทั้งหมด</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            แสดง{' '}
            <span className="font-bold text-slate-900 font-mono">
              {filteredTickets.length > 0 ? `1 - ${filteredTickets.length}` : '0'}
            </span>{' '}
            จากทั้งหมด{' '}
            <span className="font-bold text-slate-900 font-mono">{tickets.length}</span> รายการ
          </div>
          {tickets.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-lg font-mono font-bold ${
                  currentPage === 1
                    ? 'bg-[#143ee4] text-white shadow-xs'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                1
              </button>
              <button
                disabled
                className="p-1.5 rounded-lg text-slate-400 opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">
                ยืนยันการล้างข้อมูลตัวอย่าง?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ระบบจะล้างรายการใบแจ้งซ่อมตัวอย่างทั้งหมดออกจากระบบ เพื่อให้คุณสามารถเริ่มใช้งานด้วยข้อมูลจริง
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAllTickets?.();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>ยืนยันล้างข้อมูล</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
