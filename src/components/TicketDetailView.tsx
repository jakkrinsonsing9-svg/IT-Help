import React, { useState } from 'react';
import { Ticket, TicketStatus, AppTheme, ActiveView, UserProfile } from '../types';

interface TicketDetailViewProps {
  ticket: Ticket;
  currentUser?: UserProfile;
  theme: AppTheme;
  onNavigate: (view: ActiveView, ticketId?: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onAddComment: (ticketId: string, text: string, attachmentName?: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket,
  currentUser,
  theme,
  onNavigate,
  onUpdateStatus,
  onAddComment,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';
  const isAdmin = currentUser?.role === 'admin';
  const isTech = currentUser?.role === 'technician';
  const canManage = isAdmin || isTech;
  const isRequester = currentUser?.role === 'user';
  const [commentText, setCommentText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isEditingSpareNote, setIsEditingSpareNote] = useState(false);
  const [spareNote, setSpareNote] = useState(
    ticket?.spareEquipmentNote ||
      'เครื่องสำรอง: อยู่ระหว่างตรวจเช็ก'
  );
  const [unmaskedPhone, setUnmaskedPhone] = useState(false);

  if (!ticket) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto my-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
        <h2 className="font-headline text-xl font-bold text-slate-800">ไม่พบข้อมูลใบแจ้งซ่อม</h2>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          ยังไม่มีรายการใบงานในระบบ หรือใบงานนี้อาจถูกลบ/ล้างข้อมูลออกแล้ว
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('all-tickets')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            ดูรายการทั้งหมด
          </button>
          <button
            onClick={() => onNavigate('new-ticket')}
            className="px-5 py-2.5 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>สร้างใบแจ้งซ่อมใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  const cardCls = isNeu
    ? 'neu-card p-6 md:p-7'
    : 'bg-white rounded-2xl p-6 md:p-7 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(ticket.id, commentText.trim(), attachedFileName || undefined);
    setCommentText('');
    setAttachedFileName(null);
    onShowToast('ส่งข้อความแล้ว', 'เพิ่มความเห็นและข้อความตอบกลับในใบงานเรียบร้อย', 'success');
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
      onShowToast('แนบไฟล์', `เลือกไฟล์ ${e.target.files[0].name} เรียบร้อย`, 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    onShowToast('คัดลอกลิงก์', `คัดลอกลิงก์ใบงาน #${ticket.id} เรียบร้อยแล้ว`, 'success');
  };

  const displayPhone = unmaskedPhone
    ? ticket.requesterPhone
    : ticket.requesterPhone.replace(/(\d{3})-\d{3}-(\d{4})/, '$1-XXX-$2');

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Bar: Navigation & Breadcrumb */}
      <div
        className={`px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
          isNeu
            ? 'bg-[#e9eff7] border-white/60'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            onClick={() => onNavigate('all-tickets')}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#143ee4] transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>กลับไปรายการใบแจ้งซ่อม</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-bold">รายละเอียดใบแจ้งซ่อม</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-[#143ee4] font-bold">
            #{ticket.id}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition-colors ${
              isNeu
                ? 'neu-button'
                : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>พิมพ์ใบงาน</span>
          </button>
          <button
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition-colors ${
              isNeu
                ? 'neu-button'
                : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>แชร์</span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left & Center Column: Detailed Ticket Specs, Timeline & Comments (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Header Ticket Card */}
          <div className={`${cardCls} flex flex-col gap-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-[#143ee4]">
                    #{ticket.id}
                  </span>

                  {/* Status chip */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                      ticket.status === 'In Progress'
                        ? 'bg-blue-50 text-[#143ee4] border border-blue-200'
                        : ticket.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ticket.status === 'In Progress'
                          ? 'bg-[#143ee4] animate-pulse'
                          : ticket.status === 'Resolved'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    ></span>
                    {ticket.status === 'In Progress'
                      ? 'กำลังดำเนินการ (In Progress)'
                      : ticket.status === 'Resolved'
                      ? 'แก้ไขเสร็จแล้ว (Resolved)'
                      : ticket.status === 'Waiting'
                      ? 'รอข้อมูลผู้แจ้ง (Waiting)'
                      : ticket.status}
                  </span>

                  {/* Priority chip */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      ticket.priority === 'Critical' || ticket.priority === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      priority_high
                    </span>
                    ความเร่งด่วน: {ticket.priority}
                  </span>

                  {/* Category chip */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">
                      desktop_windows
                    </span>
                    {ticket.category}
                  </span>
                </div>

                <h1 className="font-headline text-xl sm:text-2xl font-bold text-slate-900 mt-2 leading-snug">
                  {ticket.title}
                </h1>
              </div>

              {/* Timestamp & SLA counter */}
              <div className="flex flex-col items-start sm:items-end text-left sm:text-right shrink-0">
                <span className="text-xs text-slate-400">วันที่สร้างใบงาน</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                  {ticket.createdAt}
                </span>
                <span className="text-xs text-blue-700 font-semibold mt-1">
                  {ticket.slaRemainingText || 'SLA เป้าหมาย: 4 ชม. (เหลือ 2 ชม. 45 นาที)'}
                </span>
              </div>
            </div>

            {/* Issue Breakdown / Full Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#143ee4] shadow-xs flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    location_on
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium">สถานที่เกิดเหตุ</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {ticket.location}
                  </span>
                  <span className="text-xs text-slate-500">{ticket.roomDetails}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-cyan-700 shadow-xs flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    laptop_mac
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium">รหัสครุภัณฑ์ / อุปกรณ์</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                    {ticket.assetTag}
                  </span>
                  <span className="text-xs text-slate-500">{ticket.assetDevice}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-red-600 shadow-xs flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium">ผลกระทบต่องาน</span>
                  <span className="text-xs sm:text-sm font-bold text-red-600">
                    {ticket.impact}
                  </span>
                  <span className="text-xs text-slate-500">มีกำหนดการเร่งด่วน</span>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#143ee4] text-[18px]">
                  notes
                </span>
                รายละเอียดปัญหาที่พบ
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                {ticket.description}
              </p>
            </div>

            {/* Attached Images Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#143ee4] text-[18px]">
                      attachment
                    </span>
                    ไฟล์รูปภาพประกอบที่แนบ ({ticket.attachments.length} ไฟล์)
                  </span>
                  <span className="text-[11px] text-slate-400">คลิกที่รูปเพื่อเปิดดูรูปขยาย</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {ticket.attachments.map((att, i) => (
                    <div
                      key={i}
                      onClick={() => setIsLightboxOpen(true)}
                      className="group relative rounded-2xl overflow-hidden bg-slate-100 cursor-pointer transition-all hover:shadow-lg max-w-sm w-full border border-slate-200"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                          <span className="material-symbols-outlined text-[24px]">
                            zoom_in
                          </span>
                          <span>คลิกเพื่อดูภาพขนาดเต็ม</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[#143ee4] text-[20px]">
                            image
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {att.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {att.size} • {att.time}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowToast('ดาวน์โหลดรูปภาพ', `เริ่มดาวน์โหลด ${att.name}`, 'info');
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#143ee4]"
                          title="ดาวน์โหลดรูปภาพ"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            download
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket Resolution Timeline (History) */}
          <div className={`${cardCls} flex flex-col gap-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900">
                    ประวัติการดำเนินงาน (Timeline)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ลำดับขั้นตอนการตรวจสอบและแก้ไขสถานะงาน
                  </p>
                </div>
              </div>
              <span className="text-xs text-blue-700 bg-blue-50 font-bold px-3 py-1 rounded-full">
                {ticket.timeline.filter((s) => s.completed).length} ขั้นตอนเสร็จสิ้น
              </span>
            </div>

            {/* Vertical Timeline List */}
            <div className="relative pl-6 space-y-5 pt-2 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {ticket.timeline.map((step) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${
                      step.completed
                        ? step.isCurrent
                          ? 'bg-[#143ee4] text-white animate-pulse'
                          : 'bg-blue-100 text-[#143ee4]'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {step.icon}
                    </span>
                  </div>
                  <div
                    className={`flex-1 p-3.5 rounded-xl border ${
                      step.isCurrent
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold ${
                          step.isCurrent ? 'text-[#143ee4]' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                          step.isCurrent
                            ? 'bg-[#143ee4] text-white'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {step.statusText}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communication & Comments System */}
          <div className={`${cardCls} flex flex-col gap-5`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900">
                    การติดต่อสื่อสารระหว่างผู้แจ้งและช่าง
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    สนทนา สอบถามข้อมูล หรือรายงานความคืบหน้า
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ทั้งหมด {ticket.comments.length} ข้อความ
              </span>
            </div>

            {/* Chat Stream */}
            <div className="flex flex-col gap-4">
              {ticket.comments.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.isTech ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-200">
                    {msg.avatar ? (
                      <img
                        src={msg.avatar}
                        alt={msg.senderName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#143ee4] text-white flex items-center justify-center font-bold text-xs">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] gap-1 ${
                      msg.isTech ? 'items-end' : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-slate-400">{msg.time}</span>
                      <span className="text-xs font-bold text-slate-800">
                        {msg.senderName}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          msg.isTech
                            ? 'bg-blue-100 text-[#143ee4]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {msg.senderRole}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.isTech
                          ? 'bg-[#143ee4] text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                      {msg.attachmentName && (
                        <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5 text-xs text-white/90">
                          <span className="material-symbols-outlined text-[16px]">
                            attachment
                          </span>
                          <span>แนบไฟล์: {msg.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Reply Form Area */}
            <form
              onSubmit={handleSendComment}
              className="mt-2 flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#143ee4] text-[18px]">
                    edit_note
                  </span>
                  เขียนข้อความตอบกลับ
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ตอบกลับในนาม: นายณัฐวุฒิ สมบูรณ์ (ช่างรับผิดชอบ)
                </span>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="พิมพ์ข้อความตอบกลับหรือสอบถามข้อมูลเพิ่มเติม..."
                rows={3}
                required
                className="w-full p-3 rounded-xl bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143ee4]/30 resize-none shadow-inner"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#143ee4]">
                      attach_file
                    </span>
                    <span>แนบไฟล์เอกสาร/รูปภาพ</span>
                    <input
                      type="file"
                      onChange={handleFileAttach}
                      className="hidden"
                    />
                  </label>
                  {attachedFileName && (
                    <span className="text-xs text-blue-700 font-semibold truncate max-w-xs">
                      {attachedFileName}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#143ee4] hover:bg-[#1034bf] text-white text-xs font-bold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>ส่งความคิดเห็น</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: People, Technician Control Panel & Quick Meta (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Technician Action Panel */}
          <div
            className={`${cardCls} flex flex-col gap-4 border-2 border-blue-200 bg-blue-50/20`}
          >
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#143ee4] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    แผงควบคุมสำหรับช่าง
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    จัดการสถานะและส่งต่อขั้นตอนงาน
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">
                verified_user
              </span>
            </div>

            {canManage ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    {isAdmin ? '🛡️ แผงควบคุมแอดมิน (อำนาจสูงสุด):' : '🛠️ ปฏิบัติการช่างเทคนิค:'}
                  </label>
                  {isAdmin && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-[#143ee4]">
                      Full Authority
                    </span>
                  )}
                </div>

                {/* If unassigned, allow Tech/Admin to Claim */}
                {(!ticket.assignedTech || ticket.status === 'Pending') && (
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, 'In Progress');
                      onShowToast('รับงานสำเร็จ', `คุณได้กดรับงาน #${ticket.id} เป็นผู้รับผิดชอบแล้ว`, 'success');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px]">handshake</span>
                      <span>กดรับเป็นผู้รับผิดชอบงานนี้ (Claim)</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}

                {/* Resolve Button */}
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, 'Resolved');
                    onShowToast(
                      'อัปเดตสำเร็จ',
                      `เปลี่ยนสถานะ #${ticket.id} เป็น 'แก้ไขเสร็จแล้ว (Resolved)'`,
                      'success'
                    );
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">
                        check_circle
                      </span>
                    </span>
                    <span>แก้ไขเสร็จแล้ว (Resolved)</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward_ios
                  </span>
                </button>

                {/* In Progress Button */}
                {ticket.status !== 'In Progress' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, 'In Progress');
                      onShowToast(
                        'อัปเดตสำเร็จ',
                        `เปลี่ยนสถานะ #${ticket.id} เป็น 'กำลังดำเนินการ'`,
                        'info'
                      );
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs border border-slate-200 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">
                        build
                      </span>
                      <span>กำลังดำเนินการซ่อม (In Progress)</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      play_arrow
                    </span>
                  </button>
                )}

                {/* Pending User Button */}
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, 'Waiting');
                    onShowToast(
                      'อัปเดตสำเร็จ',
                      `เปลี่ยนสถานะ #${ticket.id} เป็น 'รอข้อมูลจากผู้แจ้ง'`,
                      'info'
                    );
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs border border-slate-200 hover:border-purple-300 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">
                        contact_support
                      </span>
                    </span>
                    <span>รอข้อมูลจากผู้แจ้ง (Pending User)</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward_ios
                  </span>
                </button>

                {/* Admin Close Button */}
                {isAdmin && ticket.status !== 'Closed' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, 'Closed');
                      onShowToast(
                        'ปิดใบงานสมบูรณ์',
                        `แอดมินทำการปิดใบงาน #${ticket.id} ถาวร`,
                        'success'
                      );
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-emerald-400">
                        lock
                      </span>
                      <span>ปิดใบงานถาวร (Close Ticket - Admin)</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      done_all
                    </span>
                  </button>
                )}

                {/* Escalate button */}
                <button
                  onClick={() => {
                    onShowToast('ส่งต่องาน', `ส่งต่อใบงาน #${ticket.id} ให้ทีมวิศวกรโครงสร้างพื้นฐานระดับ Tier-3`, 'info');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      forward
                    </span>
                    <span>ส่งต่อให้ทีมผู้เชี่ยวชาญอื่น (Escalate)</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">
                    open_in_new
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-800">
                  เครื่องมือสำหรับผู้แจ้งซ่อม (Requester Tools):
                </label>

                {/* User Cancel Option if ticket is still pending */}
                {ticket.status === 'Pending' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, 'Cancelled');
                      onShowToast(
                        'ยกเลิกคำร้อง',
                        `คุณได้ยกเลิกคำร้อง #${ticket.id} เรียบร้อยแล้ว`,
                        'info'
                      );
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-rose-600">
                        cancel
                      </span>
                      <span>ยกเลิกคำร้องแจ้งซ่อมนี้</span>
                    </div>
                    <span className="material-symbols-outlined text-rose-400 text-[16px]">close</span>
                  </button>
                )}

                {/* Follow up / Ping Tech */}
                <button
                  onClick={() => {
                    onShowToast(
                      'ส่งสัญญาณติดตามงาน',
                      `ส่งการแจ้งเตือนติดตามความคืบหน้าของ #${ticket.id} ไปยังช่างผู้รับผิดชอบเรียบร้อย`,
                      'success'
                    );
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-[#143ee4] font-bold text-xs border border-blue-200 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-200/80 text-[#143ee4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                    </span>
                    <span>ติดตามความคืบหน้างานซ่อม (Ping)</span>
                  </div>
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">send</span>
                </button>

                {/* Print confirmation */}
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">print</span>
                    <span>พิมพ์ใบรับเรื่องแจ้งซ่อม (Print Slip)</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">print</span>
                </button>
              </div>
            )}

            {/* Spare equipment note box */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>บันทึกการส่งมอบอุปกรณ์</span>
                <button
                  onClick={() => setIsEditingSpareNote(!isEditingSpareNote)}
                  className="text-[#143ee4] hover:underline cursor-pointer"
                >
                  {isEditingSpareNote ? 'บันทึก' : 'แก้ไข'}
                </button>
              </div>

              {isEditingSpareNote ? (
                <textarea
                  value={spareNote}
                  onChange={(e) => setSpareNote(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none"
                  rows={2}
                />
              ) : (
                <div className="text-xs text-slate-600 leading-relaxed">
                  {spareNote}
                </div>
              )}
            </div>
          </div>

          {/* Requester Information Card */}
          <div className={`${cardCls} flex flex-col gap-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    ข้อมูลผู้แจ้งปัญหา
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    เจ้าหน้าที่ประจำหน่วยงาน
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                ผู้แจ้งงาน
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 shrink-0 ring-2 ring-blue-200">
                <img
                  src={
                    ticket.requesterAvatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDiJQsCwr1VqyJmlbGqb8jbSLyYbEle1fwdDCyk1HawtrgmprFZP0-AVsCqR_0ovHtWx7buZKrA280iqm01bYMZJ-BwtG1f1hRofUn7QxXZ1k0gbAooMBzHP-_kkx0Vvg2V3UvjkyMTVXyySjNWftjwl3kAJz7CPCEypnDPu-UL5z-Zpw208VSAFeJnho1oxV3FmYYMbPNHjBXltJqfSjxy16g_5dZmrxP-G7FeAeAVyuDv_z54GZk'
                  }
                  alt={ticket.requesterName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {ticket.requesterName}
                </span>
                <span className="text-xs text-slate-600 truncate">
                  {ticket.requesterDept}
                </span>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">
                  ตำแหน่ง: {ticket.requesterTitle || 'เจ้าหน้าที่ประจำหน่วยงาน'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Phone with toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                    phone
                  </span>
                  <span>เบอร์โทรศัพท์ติดต่อ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => setUnmaskedPhone(!unmaskedPhone)}
                    className="font-mono font-bold text-slate-900 cursor-pointer hover:underline"
                    title="คลิกเพื่อสลับการแสดงผลเบอร์"
                  >
                    {displayPhone}
                  </span>
                  <button
                    onClick={() =>
                      onShowToast('โทรออก', `กำลังโทรหา ${ticket.requesterName} (${ticket.requesterPhone})`, 'info')
                    }
                    className="text-[#143ee4] hover:text-[#1034bf] p-1"
                    title="โทรออก"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                    mail
                  </span>
                  <span>อีเมล</span>
                </div>
                <span className="font-mono text-slate-800 font-medium truncate max-w-[170px]">
                  {ticket.requesterEmail}
                </span>
              </div>

              {/* Campus */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                    apartment
                  </span>
                  <span>สังกัดวิทยาเขต</span>
                </div>
                <span className="font-semibold text-slate-900">
                  วิทยาเขตหลัก (Main Campus)
                </span>
              </div>
            </div>
          </div>

          {/* Technician Assigned Card */}
          <div className={`${cardCls} flex flex-col gap-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#143ee4] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    engineering
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    ช่างผู้รับผิดชอบ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    เจ้าหน้าที่ศูนย์ไอทีและเครือข่าย
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#143ee4] font-bold">
                ผู้ดูแลหลัก
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-cyan-100 shrink-0 ring-2 ring-[#143ee4]">
                <img
                  src={
                    ticket.assignedTechAvatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVPhObfMsx7YEDOJ2v88dszW25XzPpCdMui0xtmUyskaVG8Shjm0tc0eo_tdc7HkHOAfEuKqGmxdTSiHSlgk4KsGcv_Nshr0Up6Lib-o58Mwpv4v_NIoyAekWeWjWPQpAvzc_RlC6SUrrejGoI4q9pHnQnJaUUuSgpbc-7aahMsB4ROZOPb6HBTQqf_f-ONO2uQK9a2hb4nd0OHobqBpYhcGXd7oTkzgXi9OF4tzreTqvxamUz1BI'
                  }
                  alt={ticket.assignedTech || 'ช่างไอที'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">
                    {ticket.assignedTech || 'นายณัฐวุฒิ สมบูรณ์'}
                  </span>
                  <span className="material-symbols-outlined text-[#143ee4] text-[16px]">
                    verified
                  </span>
                </div>
                <span className="text-xs text-[#143ee4] font-semibold mt-0.5">
                  {ticket.assignedTechTitle || 'Senior IT Support'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  ฝ่ายโครงสร้างพื้นฐานและฮาร์ดแวร์
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-cyan-700">
                    phone_in_talk
                  </span>
                  <span>เบอร์ติดต่อภายใน</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#143ee4] bg-blue-50 px-2 py-0.5 rounded">
                    {ticket.assignedTechExt || 'ต่อ 4402'}
                  </span>
                  <button
                    onClick={() =>
                      onShowToast('โทรสายใน', 'กำลังโทรต่อไปยังหมายเลข 4402', 'info')
                    }
                    className="text-cyan-700 hover:text-cyan-900 p-1"
                    title="โทรด่วน"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-cyan-700">
                    smartphone
                  </span>
                  <span>โทรศัพท์สายตรง</span>
                </div>
                <span className="font-mono text-slate-800 font-semibold">
                  {ticket.assignedTechPhone || '02-613-4402'}
                </span>
              </div>

              {/* Quick Chat trigger button */}
              <button
                type="button"
                onClick={() => {
                  const ta = document.querySelector('textarea');
                  ta?.focus();
                  onShowToast('แชทกับช่าง', 'เลื่อนไปยังกล่องข้อความตอบกลับแล้ว', 'info');
                }}
                className="w-full mt-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#143ee4] text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>ส่งข้อความหาช่างรายนี้</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for zoom image preview */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#143ee4] text-[22px]">
                  image
                </span>
                <span className="font-bold text-sm text-slate-900">
                  error-bsod.png (1.8 MB)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onShowToast('ดาวน์โหลดรูปภาพ', 'เริ่มดาวน์โหลด error-bsod.png', 'info')
                  }
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#143ee4]"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={
                  ticket.attachments[0]?.previewUrl ||
                  ticket.attachments[0]?.url ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWe-VsvbsKKi_HYl2tgaxe05o39I9TePwi3X9QScZUUSFFN1M6aOVxaNe0_TMvXtcrqQxXrs7avE4XQD-sONxfoEYepX3PSseCGCyWuHPWOsbBgsXYLz4ONkr5Tudkva8NqxzEsGSNAwgfsu3AWBcEKbQOMvqI2YMPk7HU6FPCl-lDiTH-LFer_SXUqk8hcuK9GpBQeTVZ0TwHQcJoXw8qa_0SHG_J0ktrtkQvSDYM9Tbdph2-TVg'
                }
                alt="Zoomed BSOD"
                className="max-w-full h-auto rounded-lg shadow-md object-contain"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>หลักฐานภาพถ่ายบันทึกเมื่อ 24 พ.ค. 2024 เวลา 09:30 น.</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#143ee4] text-white text-xs font-bold"
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
