import React, { useState, useEffect } from 'react';
import {
  DEFAULT_SUPABASE_URL,
  getSupabaseConfig,
  getSupabaseClient,
  SQL_MIGRATION_SCRIPT,
  seedTicketsToSupabase,
  clearAllTicketsInSupabase,
} from '../supabaseService';
import { Ticket } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleTickets: Ticket[];
  onConnected: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  sampleTickets,
  onConnected,
  onShowToast,
}) => {
  const [projectUrl, setProjectUrl] = useState(DEFAULT_SUPABASE_URL);
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [activeTab, setActiveTab] = useState<'setup' | 'sql' | 'sync'>('setup');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [dbRowCount, setDbRowCount] = useState<number | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const checkLiveDbStatus = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setConnectionStatus('disconnected');
      return;
    }

    try {
      const { data, count, error } = await client
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          setTableExists(false);
          setDbRowCount(null);
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setTableExists(true);
        setConnectionStatus('connected');
        setDbRowCount(count || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config.url) setProjectUrl(config.url);
    if (config.anonKey) {
      setAnonKey(config.anonKey);
      setConnectionStatus('connected');
      checkLiveDbStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!anonKey.trim()) {
      onShowToast('แจ้งเตือน', 'กรุณาระบุ Supabase Anon Key จากหน้า Project Settings > API', 'error');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('testing');

    localStorage.setItem('supabase_project_url', projectUrl.trim());
    localStorage.setItem('supabase_anon_key', anonKey.trim());

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('ไม่สามารถสร้าง Supabase client ได้');
      }

      // Quick test ping
      const { error } = await client.from('tickets').select('id').limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist yet, but authentication was successful!
        setConnectionStatus('connected');
        onShowToast(
          'เชื่อมต่อสำเร็จ (รอสร้างตาราง)',
          'เชื่อมต่อกับ Supabase ได้แล้ว! กรุณาคัดลอก SQL ในแท็บ "SQL Schema" ไปรันเพื่อสร้างตาราง',
          'info'
        );
        setActiveTab('sql');
      } else if (error && error.message.includes('Invalid API key')) {
        setConnectionStatus('disconnected');
        onShowToast('API Key ไม่ถูกต้อง', 'โปรดตรวจสอบ anon key จากหน้า Supabase API settings', 'error');
      } else {
        setConnectionStatus('connected');
        onShowToast('เชื่อมต่อสำเร็จ!', `เชื่อมต่อกับ IT Help Project (${projectUrl}) เรียบร้อยแล้ว`, 'success');
        onConnected();
      }
    } catch (err: any) {
      setConnectionStatus('disconnected');
      onShowToast('การเชื่อมต่อล้มเหลว', err.message || 'โปรดตรวจสอบ URL และ Anon Key', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopiedSql(true);
    onShowToast('คัดลอก SQL แล้ว', 'นำโค้ดไปวางใน SQL Editor บน Supabase แล้วกด RUN', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    onShowToast('กำลังอัปโหลด', 'กำลังนำเข้าข้อมูลใบแจ้งซ่อมตัวอย่าง 12 รายการเข้าสู่ Supabase...', 'info');

    const res = await seedTicketsToSupabase(sampleTickets);
    setIsSeeding(false);

    if (res.success) {
      onShowToast('นำเข้าข้อมูลสำเร็จ!', `อัปโหลดใบงานจำนวน ${res.count} รายการไปยัง Supabase แล้ว`, 'success');
      onConnected();
    } else {
      onShowToast('เกิดข้อผิดพลาด', res.error || 'โปรดรัน SQL สร้างตารางก่อนนำเข้าข้อมูล', 'error');
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    onShowToast('กำลังล้างข้อมูล', 'กำลังลบข้อมูลใบแจ้งซ่อมทั้งหมดในตาราง Supabase...', 'info');

    const res = await clearAllTicketsInSupabase();
    setIsClearing(false);

    if (res.success) {
      onShowToast('ล้างข้อมูลสำเร็จ!', 'ลบข้อมูลใบงานทั้งหมดใน Supabase เรียบร้อยแล้ว', 'success');
      setDbRowCount(0);
      onConnected();
    } else {
      onShowToast('เกิดข้อผิดพลาด', res.error || 'ไม่สามารถลบข้อมูลได้', 'error');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.32 14.286a.396.396 0 0 0 .31.637H12v8.958a.396.396 0 0 0 .716.233l10.964-14.123a.396.396 0 0 0-.318-.637z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-base text-white">
                  เชื่อมต่อ Supabase Database
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  IT Help Project
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                {DEFAULT_SUPABASE_URL}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Status Strip from User's Screenshot */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800">Status: Healthy</span>
            <span className="text-slate-400">•</span>
            <span>Compute: NANO (t3.nano)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Southeast Asia (Singapore)</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
              ap-southeast-1
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-[#143ee4] text-[#143ee4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>ตั้งค่าการเชื่อมต่อ (Setup)</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#143ee4] text-[#143ee4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>สร้างตาราง (SQL Schema)</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-[#143ee4] text-[#143ee4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>ซิงค์ข้อมูลตัวอย่าง (Seed Data)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Supabase Anon Public API Key <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="https://supabase.com/dashboard/project/ronqdmeqfvqrmgkmzchg/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#143ee4] font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>เปิดหน้า API Settings บน Supabase</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                </div>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  วิธีดู Key: ในหน้าแดชบอร์ด Supabase ของคุณ ไปที่เมนู <strong>Project Settings (รูปเฟือง)</strong> &gt; <strong>API</strong> &gt; ส่วน <strong>Project API keys</strong> ให้ Copy ค่าของ <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-bold">anon</code> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">public</code> มาวางที่นี่
                </p>
              </div>

              {/* Live Database Inspection Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#143ee4]">
                      fact_check
                    </span>
                    สถานะการตรวจสอบฐานข้อมูล Supabase แบบเรียลไทม์:
                  </span>
                  <button
                    type="button"
                    onClick={checkLiveDbStatus}
                    className="text-xs text-[#143ee4] hover:underline font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>ตรวจสอบใหม่</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">การยืนยันตัวตน API:</span>
                    <span className="font-bold flex items-center gap-1 mt-0.5 text-emerald-700">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {connectionStatus === 'connected' ? 'เชื่อมต่อสำเร็จ' : 'ยังไม่เชื่อมต่อ'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">ตาราง public.tickets:</span>
                    <span
                      className={`font-bold flex items-center gap-1 mt-0.5 ${
                        tableExists
                          ? 'text-emerald-700'
                          : tableExists === false
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {tableExists ? 'check_circle' : 'pending'}
                      </span>
                      {tableExists ? 'พบตารางพร้อมใช้งาน' : tableExists === false ? 'ยังไม่พบตาราง' : 'รอตรวจสอบ'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">จำนวนใบงานในฐานข้อมูล:</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5 text-sm">
                      {dbRowCount !== null ? `${dbRowCount} แถว` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                  cloud_done
                </span>
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <span className="font-bold block">โปรเจกต์ IT Help Project พร้อมเชื่อมต่อ</span>
                  เมื่อเชื่อมต่อแล้ว ระบบจะอ่านและบันทึกใบแจ้งซ่อมใหม่ (Tickets), ประวัติ Timeline และแชททั้งหมดลงในฐานข้อมูล PostgreSQL ของคุณแบบถาวร
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-bold text-xs text-slate-900">
                    สคริปต์ SQL สร้างตาราง (Table & Policy)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    นำคำสั่งนี้ไปรันในเมนู <strong>SQL Editor</strong> บน Supabase Dashboard
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {SQL_MIGRATION_SCRIPT}
              </pre>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  info
                </span>
                <span>สร้างตาราง <code className="font-mono font-bold text-slate-700">public.tickets</code> พร้อมเปิด RLS Policy สำหรับอ่าน/เขียนเรียบร้อย</span>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#143ee4] text-[22px] shrink-0 mt-0.5">
                  database
                </span>
                <div className="text-xs text-blue-950 leading-relaxed">
                  <span className="font-bold block text-sm">
                    อัปโหลดข้อมูลเริ่มต้น ({sampleTickets.length} ใบงาน)
                  </span>
                  หากตารางของคุณยังว่างอยู่ คุณสามารถกดปุ่มด้านล่างเพื่ออัปโหลดข้อมูลใบงานตัวอย่าง เช่น เคสจอฟ้า (#TK-2024-0042), ปัญหา WiFi, ปริ้นเตอร์, เข้า Supabase ได้ทันที
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding || isClearing || connectionStatus !== 'connected'}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSeeding ? 'sync' : 'upload_file'}
                  </span>
                  <span>
                    {isSeeding
                      ? 'กำลังนำเข้าข้อมูล...'
                      : connectionStatus !== 'connected'
                      ? 'โปรดบันทึก Anon Key ก่อนนำเข้า'
                      : 'นำเข้าข้อมูลตัวอย่างเข้า Supabase'}
                  </span>
                </button>

                <button
                  onClick={handleClearData}
                  disabled={isClearing || isSeeding || connectionStatus !== 'connected'}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  title="ลบข้อมูลใบงานทั้งหมดในตาราง Supabase"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isClearing ? 'sync' : 'delete_sweep'}
                  </span>
                  <span>
                    {isClearing ? 'กำลังล้างข้อมูล...' : 'ล้างข้อมูลทั้งหมดใน Supabase'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500'
                  : connectionStatus === 'testing'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            ></span>
            <span className="font-semibold text-slate-700">
              {connectionStatus === 'connected'
                ? 'พร้อมใช้งาน (Connected)'
                : connectionStatus === 'testing'
                ? 'กำลังตรวจสอบการเชื่อมต่อ...'
                : 'ยังไม่ระบุ Anon Key'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isTesting ? 'sync' : 'link'}
              </span>
              <span>{isTesting ? 'กำลังทดสอบ...' : 'บันทึกและเชื่อมต่อ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
