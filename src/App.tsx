/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Ticket,
  Technician,
  UserProfile,
  ActiveView,
  AppTheme,
  TicketStatus,
} from './types';
import { CURRENT_USER, TECHNICIANS_LIST, INITIAL_TICKETS, SAMPLE_TICKETS_TEMPLATE } from './mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { AllTicketsView } from './components/AllTicketsView';
import { TicketDetailView } from './components/TicketDetailView';
import { NewTicketView } from './components/NewTicketView';
import { AuthPortalView } from './components/AuthPortalView';
import { UsersView } from './components/UsersView';
import { ProfileView } from './components/ProfileView';
import { SupabaseModal } from './components/SupabaseModal';
import {
  getSupabaseConfig,
  fetchTicketsFromSupabase,
  insertTicketToSupabase,
  updateTicketInSupabase,
  clearAllTicketsInSupabase,
} from './supabaseService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('user_profile');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return CURRENT_USER;
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('it_tickets');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_TICKETS;
  });
  const [technicians, setTechnicians] = useState<Technician[]>(TECHNICIANS_LIST);
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [theme, setTheme] = useState<AppTheme>('modern');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist tickets locally
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('it_tickets', JSON.stringify(tickets));
      } catch (e) {
        // ignore
      }
    }
  }, [tickets]);

  // Check Supabase on mount
  React.useEffect(() => {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      setIsSupabaseConnected(true);
      fetchTicketsFromSupabase().then((dbTickets) => {
        if (dbTickets) {
          setTickets(dbTickets);
        }
      });
    }
  }, []);

  // Toast handler
  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + '-' + Math.random(),
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation handler
  const handleNavigate = (view: ActiveView, ticketId?: string) => {
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Claim Ticket action
  const handleClaimTicket = (ticketId: string) => {
    let updatedTicket: Ticket | null = null;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          updatedTicket = {
            ...t,
            assignedTech: currentUser.name,
            status: 'In Progress',
            timeline: [
              ...t.timeline,
              {
                id: 'claim-' + Date.now(),
                title: `${currentUser.name} รับงานเข้าระบบ`,
                time: 'วันนี้ • เมื่อสักครู่',
                desc: 'เจ้าหน้าที่ไอทีกดรับมอบหมายใบงานเป็นผู้รับผิดชอบหลัก',
                statusText: 'สถานะ: กำลังดำเนินการ (In Progress)',
                icon: 'assignment_turned_in',
                completed: true,
                isCurrent: true,
              },
            ],
          };
          return updatedTicket;
        }
        return t;
      })
    );

    if (updatedTicket) {
      updateTicketInSupabase(ticketId, {
        assignedTech: currentUser.name,
        status: 'In Progress',
        timeline: (updatedTicket as Ticket).timeline,
      });
    }

    showToast('รับงานสำเร็จ', `คุณได้รับมอบหมายใบงาน #${ticketId} เรียบร้อยแล้ว`, 'success');
  };

  // Update Status action
  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    let updatedTimeline: any[] = [];
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          updatedTimeline = [
            ...t.timeline,
            {
              id: 'status-' + Date.now(),
              title: `ปรับสถานะเป็น ${newStatus}`,
              time: 'วันนี้ • เมื่อสักครู่',
              desc: `เจ้าหน้าที่ปรับสถานะงานเป็น [${newStatus}]`,
              statusText: `สถานะ: ${newStatus}`,
              icon: newStatus === 'Resolved' ? 'check_circle' : 'update',
              completed: true,
              isCurrent: true,
            },
          ];
          return {
            ...t,
            status: newStatus,
            timeline: updatedTimeline,
          };
        }
        return t;
      })
    );

    updateTicketInSupabase(ticketId, {
      status: newStatus,
      timeline: updatedTimeline,
    });
  };

  // Add Comment action
  const handleAddComment = (ticketId: string, text: string, attachmentName?: string) => {
    const newComment = {
      id: 'com-' + Date.now(),
      senderName: currentUser.name,
      senderRole: currentUser.role === 'admin' ? 'ช่างรับผิดชอบ' : 'ผู้แจ้งปัญหา',
      time: 'เมื่อสักครู่',
      text,
      isTech: currentUser.role === 'admin',
      avatar: currentUser.avatar,
      attachmentName,
    };

    let allComments: any[] = [];
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          allComments = [...t.comments, newComment];
          return {
            ...t,
            comments: allComments,
          };
        }
        return t;
      })
    );

    updateTicketInSupabase(ticketId, { comments: allComments });
  };

  // Create Ticket action
  const handleCreateTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    insertTicketToSupabase(newTicket);
  };

  // Update Tech Status action
  const handleUpdateTechStatus = (
    techId: string,
    status: 'available' | 'busy' | 'remote'
  ) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === techId ? { ...t, status } : t))
    );
  };

  // Clear all sample / existing tickets
  const handleClearAllTickets = async () => {
    setTickets([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('it_tickets');
    }
    setSelectedTicketId('');

    if (isSupabaseConnected) {
      showToast('กำลังล้าง Supabase', 'กำลังล้างข้อมูลใบงานในตาราง tickets บน Supabase...', 'info');
      const res = await clearAllTicketsInSupabase();
      if (res.success) {
        showToast('ล้างข้อมูลสำเร็จ', 'ล้างข้อมูลตัวอย่างทั้งในระบบและฐานข้อมูล Supabase เรียบร้อยแล้ว', 'success');
      } else {
        showToast('ล้างในระบบแล้ว', `ล้างในระบบเรียบร้อย (Supabase: ${res.error})`, 'info');
      }
    } else {
      showToast('ล้างข้อมูลสำเร็จ', 'ล้างข้อมูลตัวอย่างทั้งหมดเรียบร้อย ระบบพร้อมรับข้อมูลจริง', 'success');
    }
  };

  // Restore sample tickets for preview/testing
  const handleLoadSampleTickets = () => {
    setTickets(SAMPLE_TICKETS_TEMPLATE);
    if (SAMPLE_TICKETS_TEMPLATE.length > 0) {
      setSelectedTicketId(SAMPLE_TICKETS_TEMPLATE[0].id);
    }
    showToast('โหลดข้อมูลตัวอย่างแล้ว', 'นำเข้าข้อมูลตัวอย่างเพื่อการทดสอบเรียบร้อย', 'info');
  };

  // Toggle between Admin and User roles
  const handleToggleRole = () => {
    setCurrentUser((prev) => {
      const isCurrentlyAdmin = prev.role === 'admin';
      const updated: UserProfile = isCurrentlyAdmin
        ? {
            id: 'usr-002',
            name: 'คุณกัญญา วัฒนากุล',
            email: 'kanya.w@org.ac.th',
            role: 'user',
            roleLabel: 'บุคลากรทั่วไป (Staff)',
            department: 'แผนกบัญชีและการเงิน',
            phone: '089-452-9912',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDiJQsCwr1VqyJmlbGqb8jbSLyYbEle1fwdDCyk1HawtrgmprFZP0-AVsCqR_0ovHtWx7buZKrA280iqm01bYMZJ-BwtG1f1hRofUn7QxXZ1k0gbAooMBzHP-_kkx0Vvg2V3UvjkyMTVXyySjNWftjwl3kAJz7CPCEypnDPu-UL5z-Zpw208VSAFeJnho1oxV3FmYYMbPNHjBXltJqfSjxy16g_5dZmrxP-G7FeAeAVyuDv_z54GZk',
            campus: 'วิทยาเขตหลัก (Main Campus)',
          }
        : {
            id: 'usr-001',
            name: 'สมชาย ศรีสุวรรณ',
            email: 'somchai.s@univ.ac.th',
            role: 'admin',
            roleLabel: 'เจ้าหน้าที่ไอที / แอดมินระบบ',
            department: 'ศูนย์เทคโนโลยีสารสนเทศและบริการเครือข่าย',
            phone: '081-889-4512',
            avatar:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBnWTsL_F2iP2oickxsBBUrQu5xTSfx2c1ubl5wm7wjXarPHiWrFJITGxiQJatzdfhybnmHFLyCoMwxIXxAhyMoxV59crpYJ3PpLl9_NDgB-WTK7xj7YTxoc7EW9ZcZLXveb3cuYFc_J-vgMMtrBoOSQ2MAhXm6JfJKtx3pn0lOvIXq3pt8GIRgknFMFZvDj2oH9xdv-H_eLPBIVotoHN8PkQiQY_x6cGPeE4YUxmsLjUHd8hL9VR0',
            campus: 'วิทยาเขตหลัก (Main Campus)',
          };

      try {
        localStorage.setItem('user_profile', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      showToast(
        'สลับบทบาทเรียบร้อย',
        `ขณะนี้คุณอยู่ในมุมมอง ${updated.role === 'admin' ? '🛡️ แอดมิน (Admin)' : '👤 ผู้ใช้ทั่วไป (User)'} (${updated.name})`,
        'info'
      );
      return updated;
    });
  };

  // Find currently selected ticket or fallback to first
  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Filter tickets for "My Tickets" view (claimed by me or submitted by me)
  const myTickets = tickets.filter(
    (t) =>
      t.assignedTech === currentUser.name ||
      t.requesterName === currentUser.name ||
      t.requesterEmail === currentUser.email
  );

  // If viewing Auth portal, render it full screen
  if (currentView === 'auth') {
    return (
      <div className={theme === 'neumorphic' ? 'bg-[#e9eff7]' : 'bg-[#f8f9ff]'}>
        <AuthPortalView
          currentUser={currentUser}
          onLoginAs={(user) => {
            setCurrentUser(user);
          }}
          onNavigate={(view) => setCurrentView(view)}
          onShowToast={showToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  const bgCls = theme === 'neumorphic' ? 'bg-[#e9eff7]' : 'bg-[#f8f9ff]';

  return (
    <div className={`min-h-screen text-[#0b1c30] antialiased ${bgCls}`}>
      {/* Toast Notification Hub */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Main Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        currentUser={currentUser}
        theme={theme}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAuth={() => setCurrentView('auth')}
      />

      {/* Main Wrapper with left margin on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header Bar */}
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && currentView !== 'all-tickets' && currentView !== 'dashboard') {
              setCurrentView('all-tickets');
            }
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() =>
            setTheme(theme === 'modern' ? 'neumorphic' : 'modern')
          }
          onNavigate={(v) => handleNavigate(v)}
          onOpenAuth={() => setCurrentView('auth')}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
          onToggleRole={handleToggleRole}
          unreadCount={tickets.filter((t) => t.priority === 'Critical').length}
        />

        {/* Supabase Connection Modal */}
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          sampleTickets={SAMPLE_TICKETS_TEMPLATE}
          onConnected={() => {
            setIsSupabaseConnected(true);
            fetchTicketsFromSupabase().then((dbTickets) => {
              if (dbTickets) {
                setTickets(dbTickets);
              }
            });
          }}
          onShowToast={showToast}
        />

        {/* View Router */}
        <main className="pt-16 flex-1 w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              tickets={tickets}
              technicians={technicians}
              theme={theme}
              onNavigate={handleNavigate}
              onClaimTicket={handleClaimTicket}
              onShowToast={showToast}
            />
          )}

          {currentView === 'all-tickets' && (
            <AllTicketsView
              tickets={tickets}
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onClaimTicket={handleClaimTicket}
              onUpdateStatus={handleUpdateStatus}
              onShowToast={showToast}
              onClearAllTickets={handleClearAllTickets}
              onLoadSampleTickets={handleLoadSampleTickets}
            />
          )}

          {currentView === 'my-tickets' && (
            <AllTicketsView
              tickets={myTickets}
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onClaimTicket={handleClaimTicket}
              onUpdateStatus={handleUpdateStatus}
              onShowToast={showToast}
              onClearAllTickets={handleClearAllTickets}
              onLoadSampleTickets={handleLoadSampleTickets}
            />
          )}

          {currentView === 'ticket-detail' && (
            <TicketDetailView
              ticket={selectedTicket}
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onShowToast={showToast}
            />
          )}

          {currentView === 'new-ticket' && (
            <NewTicketView
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onCreateTicket={handleCreateTicket}
              onShowToast={showToast}
            />
          )}

          {currentView === 'users' && (
            <UsersView
              technicians={technicians}
              theme={theme}
              onUpdateTechStatus={handleUpdateTechStatus}
              onShowToast={showToast}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              theme={theme}
              onUpdateProfile={(up) => {
                setCurrentUser((prev) => {
                  const updated = { ...prev, ...up };
                  try {
                    localStorage.setItem('user_profile', JSON.stringify(updated));
                  } catch (e) {
                    // ignore
                  }
                  return updated;
                });
              }}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
