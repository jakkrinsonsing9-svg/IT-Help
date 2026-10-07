import React, { useState, useMemo } from 'react';
import {
  Ticket,
  TicketStatus,
  TicketCategory,
  UserProfile,
  AppTheme,
  ActiveView,
} from '../types';

interface TechWorkspaceViewProps {
  tickets: Ticket[];
  currentUser: UserProfile;
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onClaimTicket: (ticketId: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TechWorkspaceView: React.FC<TechWorkspaceViewProps> = ({
  tickets,
  currentUser,
  theme,
  onNavigate,
  onClaimTicket,
  onUpdateStatus,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'unassigned-pool' | 'completed'>('my-tasks');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [quickResolutionText, setQuickResolutionText] = useState<string>('');
  const [selectedTicketForNote, setSelectedTicketForNote] = useState<string | null>(null);

  // Tickets assigned to this technician
  const myAssignedTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (t.assignedTech === currentUser.name) return true;
      if (currentUser.techCode && t.assignedTech?.includes(currentUser.techCode)) return true;
      return false;
    });
  }, [tickets, currentUser]);

  // Unassigned or Pending tickets available for pickup
  const unassignedTickets = useMemo(() => {
    return tickets.filter((t) => !t.assignedTech || t.status === 'Pending');
  }, [tickets]);

  // Completed tickets by this technician
  const completedTickets = useMemo(() => {
    return myAssignedTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
  }, [myAssignedTickets]);

  // Active (in-progress or accepted) tickets for this technician
  const activeMyTasks = useMemo(() => {
    return myAssignedTickets.filter(
      (t) => t.status === 'Accepted' || t.status === 'In Progress' || t.status === 'Waiting'
    );
  }, [myAssignedTickets]);

  // Filtered by category for current tab
  const displayedTickets = useMemo(() => {
    let source =
      activeTab === 'my-tasks'
        ? activeMyTasks
        : activeTab === 'unassigned-pool'
        ? unassignedTickets
        : completedTickets;

    if (filterCategory !== 'all') {
      source = source.filter((t) => t.category === filterCategory);
    }
    return source;
  }, [activeTab, activeMyTasks, unassignedTickets, completedTickets, filterCategory]);

  const cardCls = isNeu
    ? 'neu-card p-5'
    : 'bg-white rounded-2xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isNeu
            ? 'neu-flat bg-[#e9eff7]'
            : 'bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/60 bg-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="material-symbols-outlined text-3xl">engineering</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                🛠️ ส่วนสำหรับช่างเทคนิค
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentUser.techCode ? `รหัสช่าง: ${currentUser.techCode}` : 'IT Support Specialist'}
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              โต๊ะปฏิบัติการช่างเทคนิค (Technician Workspace)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              จัดการคิวงานที่ได้รับมอบหมาย กดรับงานจากคลังกลาง และบันทึกผลการซ่อมส่งคืนผู้ใช้บริการ
            </p>
          </div>
        </div>

        {/* Quick Shift Status */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              สถานะพร้อมปฏิบัติงาน
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-900">เข้าเวรพร้อมรับงาน</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('new-ticket')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>เปิดงานซ่อมแทนผู้ใช้</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Metric Cards for Technician */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My active jobs */}
        <div
          onClick={() => setActiveTab('my-tasks')}
          className={`cursor-pointer transition-all ${cardCls} ${
            activeTab === 'my-tasks' ? 'ring-2 ring-amber-500 bg-amber-50/20' : 'hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งานที่ฉันกำลังทำอยู่</span>
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">build_circle</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline text-3xl font-extrabold text-slate-900">
              {activeMyTasks.length}
            </span>
            <span className="text-xs text-slate-500">รายการ</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>งานที่รับผิดชอบและต้องแก้ไข</span>
          </div>
        </div>

        {/* Card 2: Unassigned Ticket Pool */}
        <div
          onClick={() => setActiveTab('unassigned-pool')}
          className={`cursor-pointer transition-all ${cardCls} ${
            activeTab === 'unassigned-pool'
              ? 'ring-2 ring-blue-500 bg-blue-50/20'
              : 'hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">คลังงานกลาง (รอรับงาน)</span>
            <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">inbox</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline text-3xl font-extrabold text-blue-600">
              {unassignedTickets.length}
            </span>
            <span className="text-xs text-slate-500">รายการค้าง</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            <span>ช่างสามารถกด "หยิบรับงาน" ได้ทันที</span>
          </div>
        </div>

        {/* Card 3: Resolved jobs */}
        <div
          onClick={() => setActiveTab('completed')}
          className={`cursor-pointer transition-all ${cardCls} ${
            activeTab === 'completed'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
              : 'hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งานที่ปิดสำเร็จแล้ว</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">task_alt</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline text-3xl font-extrabold text-emerald-600">
              {completedTickets.length}
            </span>
            <span className="text-xs text-slate-500">งานเสร็จสิ้น</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span>ผลงานการปิดเคสของคุณ</span>
          </div>
        </div>

        {/* Card 4: Urgent tickets needing attention */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งานเร่งด่วน / SLA สูง</span>
            <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">priority_high</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-headline text-3xl font-extrabold text-rose-600">
              {tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High').length}
            </span>
            <span className="text-xs text-slate-500">เคสด่วน</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>ต้องดำเนินการตาม SLA ทันที</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Section: Tabs + Filter + Task Cards */}
      <div className={cardCls}>
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my-tasks'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>งานที่ฉันรับผิดชอบ ({activeMyTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('unassigned-pool')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'unassigned-pool'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">inbox</span>
              <span>คลังงานรอหยิบ ({unassignedTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>งานเสร็จสิ้น ({completedTickets.length})</span>
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">หมวดหมู่:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">ทุกหมวดหมู่อุปกรณ์</option>
              <option value="Computer">คอมพิวเตอร์ (Computer)</option>
              <option value="Network">ระบบเครือข่าย (Network)</option>
              <option value="Software">ซอฟต์แวร์ (Software)</option>
              <option value="Printer">เครื่องพิมพ์ (Printer)</option>
              <option value="Account">บัญชีผู้ใช้ (Account)</option>
              <option value="Other">อื่นๆ (Other)</option>
            </select>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="mt-5 space-y-4">
          {displayedTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl block mb-2 text-slate-300">
                {activeTab === 'my-tasks'
                  ? 'checklist_rtl'
                  : activeTab === 'unassigned-pool'
                  ? 'inventory_2'
                  : 'task_alt'}
              </span>
              <p className="text-base font-bold text-slate-700">
                {activeTab === 'my-tasks'
                  ? 'คุณยังไม่มีงานที่ค้างอยู่'
                  : activeTab === 'unassigned-pool'
                  ? 'ไม่มีงานรอหยิบในคลังกลาง'
                  : 'ยังไม่มีประวัติงานที่ปิดเคสแล้ว'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {activeTab === 'my-tasks'
                  ? 'ยอดเยี่ยมมาก! คุณสามารถคลิกแท็บ "คลังงานรอหยิบ" ด้านบน เพื่อรับงานใหม่เข้าระบบได้'
                  : 'หากมีคำร้องแจ้งซ่อมใหม่จากผู้ใช้ จะปรากฏขึ้นในหน้านี้ทันที'}
              </p>
              {activeTab === 'my-tasks' && unassignedTickets.length > 0 && (
                <button
                  onClick={() => setActiveTab('unassigned-pool')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">touch_app</span>
                  <span>ไปที่คลังงานเพื่อหยิบงาน ({unassignedTickets.length} รายการ)</span>
                </button>
              )}
            </div>
          ) : (
            displayedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Ticket Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-[#143ee4]">
                      {ticket.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        ticket.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.priority === 'Critical'
                        ? '🚨 ด่วนวิกฤต'
                        : ticket.priority === 'High'
                        ? '⚠️ ด่วนมาก'
                        : ticket.priority}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {ticket.category}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ticket.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-900'
                          : ticket.status === 'Accepted'
                          ? 'bg-blue-100 text-blue-900'
                          : ticket.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      สถานะ: {ticket.status}
                    </span>
                  </div>

                  <h3
                    onClick={() => onNavigate('ticket-detail', ticket.id)}
                    className="font-headline font-bold text-base text-slate-900 hover:text-[#143ee4] cursor-pointer transition-colors"
                  >
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        person
                      </span>
                      {ticket.requesterName} ({ticket.requesterDept})
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        location_on
                      </span>
                      {ticket.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        phone
                      </span>
                      {ticket.requesterPhone}
                    </span>
                    {ticket.assetTag && (
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        ครุภัณฑ์: {ticket.assetTag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Technician Actions */}
                <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* If unassigned or in pool, show claim button */}
                  {!ticket.assignedTech || ticket.status === 'Pending' ? (
                    <button
                      onClick={() => {
                        onClaimTicket(ticket.id);
                        onShowToast('รับงานสำเร็จ!', `คุณได้กดรับงาน #${ticket.id} เข้าระบบเรียบร้อย`, 'success');
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">handshake</span>
                      <span>หยิบรับงานนี้</span>
                    </button>
                  ) : (
                    /* Tech can update progress */
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => {
                            onUpdateStatus(ticket.id, 'In Progress');
                            onShowToast('เริ่มซ่อม', `เปลี่ยนสถานะ #${ticket.id} เป็น กำลังดำเนินการ`, 'info');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                        >
                          เริ่มซ่อม (In Progress)
                        </button>
                      )}

                      {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                        <button
                          onClick={() => {
                            onUpdateStatus(ticket.id, 'Resolved');
                            onShowToast('ปิดงานสำเร็จ', `บันทึกสถานะ #${ticket.id} เป็น ซ่อมเสร็จแล้ว`, 'success');
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>ปิดงาน (Resolved)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Detail View Link */}
                  <button
                    onClick={() => onNavigate('ticket-detail', ticket.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <span>ดูรายละเอียดเต็ม</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
