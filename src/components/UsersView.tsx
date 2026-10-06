import React, { useState } from 'react';
import { Technician, AppTheme } from '../types';

interface UsersViewProps {
  technicians: Technician[];
  theme: AppTheme;
  onUpdateTechStatus: (techId: string, status: 'available' | 'busy' | 'remote') => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  technicians,
  theme,
  onUpdateTechStatus,
  onShowToast,
}) => {
  const isNeu = theme === 'neumorphic';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTechs = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardCls = isNeu
    ? 'neu-card p-6'
    : 'bg-white rounded-2xl p-6 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-slate-200/70';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
            ช่างและผู้ใช้งานในระบบ (Technicians & Roster)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบความพร้อมการปฏิบัติการ ตารางเข้าเวรประจำวัน และปริมาณงานที่รับผิดชอบ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาช่าง, รหัส หรือตำแหน่ง..."
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
              isNeu ? 'neu-inset border-0' : 'bg-slate-100 border border-slate-200'
            }`}
          />
          <button
            onClick={() => onShowToast('จัดตารางเวร', 'เปิดโหมดแก้ไขตารางเวรประจำสัปดาห์', 'info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              isNeu ? 'neu-button text-[#143ee4]' : 'bg-[#143ee4] text-white hover:bg-[#1034bf]'
            }`}
          >
            จัดตารางเวร
          </button>
        </div>
      </div>

      {/* Grid of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTechs.map((t) => (
          <div key={t.id} className={`${cardCls} flex flex-col justify-between`}>
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
                  ></span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {t.code}
                </span>
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
                  <span>เบอร์ต่อภายใน:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ต่อ {t.extension}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ภาระงานคงค้าง:</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
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

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">ปรับสถานะ:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onUpdateTechStatus(t.id, 'available');
                    onShowToast('อัปเดตสถานะ', `${t.name} พร้อมรับงานแล้ว`, 'success');
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    t.status === 'available'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  พร้อม
                </button>
                <button
                  onClick={() => {
                    onUpdateTechStatus(t.id, 'busy');
                    onShowToast('อัปเดตสถานะ', `${t.name} เปลี่ยนสถานะเป็นติดภารกิจ`, 'info');
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    t.status === 'busy'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ติดงาน
                </button>
                <button
                  onClick={() => {
                    onUpdateTechStatus(t.id, 'remote');
                    onShowToast('อัปเดตสถานะ', `${t.name} กำลังรีโมทซ่อม`, 'info');
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    t.status === 'remote'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  รีโมท
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
