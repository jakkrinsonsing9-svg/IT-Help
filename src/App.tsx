/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Ticket,
  Technician,
  UserProfile,
  UserRole,
  ActiveView,
  AppTheme,
  TicketStatus,
} from './types';
import {
  CURRENT_USER,
  ROLE_ACCOUNTS,
  TECHNICIANS_LIST,
  INITIAL_TICKETS,
  SAMPLE_TICKETS_TEMPLATE,
} from './mockData';
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
import { TechWorkspaceView } from './components/TechWorkspaceView';
import { AdminCenterView } from './components/AdminCenterView';
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
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed.email === 'somchai.s@univ.ac.th' ||
            parsed.email === 'worawit.y@univ.ac.th' ||
            parsed.email === 'kanya.w@org.ac.th' ||
            parsed.email === 'tech@example.com' ||
            parsed.id === 'usr-tech-01' ||
            parsed.id === 'usr-user-01' ||
            (parsed.role === 'admin' && parsed.email !== 'jakkrinsonsing9@gmail.com')
          ) {
            localStorage.setItem('user_profile', JSON.stringify(ROLE_ACCOUNTS.admin));
            return ROLE_ACCOUNTS.admin;
          }
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return ROLE_ACCOUNTS.admin;
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
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('it_technicians');
        if (saved) {
          const parsed = JSON.parse(saved);
          // filter out mock default technicians (tech-01 to tech-04)
          const realTechs = parsed.filter(
            (t: any) =>
              !['tech-01', 'tech-02', 'tech-03', 'tech-04'].includes(t.id) &&
              !['worawit.y@univ.ac.th', 'kanda.n@univ.ac.th', 'thanakorn.p@univ.ac.th'].includes(
                t.email
              )
          );
          return realTechs;
        }
      } catch (e) {
        // ignore
      }
    }
    return TECHNICIANS_LIST;
  });
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

  // Persist technicians locally
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('it_technicians', JSON.stringify(technicians));
      } catch (e) {
        // ignore
      }
    }
  }, [technicians]);

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

  // Add Technician action
  const handleAddTechnician = (newTech: Technician) => {
    setTechnicians((prev) => [newTech, ...prev]);
    showToast('แต่งตั้งช่างสำเร็จ', `เพิ่ม ${newTech.name} (${newTech.code}) เข้าสู่รายชื่อทีมช่างแล้ว`, 'success');
  };

  // Delete / Remove Technician action
  const handleDeleteTechnician = (techId: string) => {
    const target = technicians.find((t) => t.id === techId);
    setTechnicians((prev) => prev.filter((t) => t.id !== techId));
    showToast('ลบช่างเรียบร้อย', `ลบ ${target?.name || 'ช่าง'} ออกจากทีมปฏิบัติการเรียบร้อย`, 'info');
  };

  // Update Technician action
  const handleUpdateTechnician = (updatedTech: Technician) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === updatedTech.id ? updatedTech : t))
    );
    showToast('บันทึกข้อมูลช่างแล้ว', `อัปเดตข้อมูล ${updatedTech.name} เรียบร้อย`, 'success');
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

  // Switch to specific role with predefined profile and route
  const handleSwitchRole = (newRole: UserRole) => {
    let account: UserProfile;
    if (newRole === 'admin') {
      account = ROLE_ACCOUNTS.admin;
    } else if (newRole === 'technician') {
      if (technicians.length > 0) {
        const firstTech = technicians[0];
        account = {
          id: firstTech.id,
          name: firstTech.name,
          email: `${firstTech.code.toLowerCase()}@organization.ac.th`,
          role: 'technician',
          roleLabel: `ช่างเทคนิค (${firstTech.code})`,
          department: firstTech.department,
          phone: firstTech.phone,
          avatar: firstTech.avatar,
          campus: 'วิทยาเขตหลัก',
          techCode: firstTech.code,
        };
      } else {
        account = {
          id: 'usr-tech-active',
          name: 'ช่างเทคนิคประจำเวร',
          email: 'technician@organization.ac.th',
          role: 'technician',
          roleLabel: 'ช่างเทคนิคไอที (IT Technician)',
          department: 'ฝ่ายบริการเทคโนโลยีสารสนเทศ',
          phone: '085-000-4401',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAfP2hFoqefB-ZXmay836sp_LlaLisj-lQcqAgBxFCIbZGWUaVN06HRgYAEhCBdZHBGiiXairDtSQhEiEFhsIJ0Eslqdy3jmP9FldoJbEyGWUV7U2o7dyY-V7BdignbAHcLn3ZvFte-ShZKDBS4ltDnF1K53JHvpYUMTD7_lC88u3iovlrORGf5Bqlc6-7Hbghetn3t0KMaOVa4MZp22oB6peu1ANtjQeUhiG6_WxiWRlFwN9IvrXI',
          campus: 'วิทยาเขตหลัก',
          techCode: 'IT-01',
        };
      }
    } else {
      account = {
        id: 'usr-requester-active',
        name: 'ผู้ใช้บริการ (Requester)',
        email: 'requester@organization.ac.th',
        role: 'user',
        roleLabel: 'ผู้ใช้บริการ (Staff / Requester)',
        department: 'หน่วยงานทั่วไป',
        phone: '089-000-1234',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDiJQsCwr1VqyJmlbGqb8jbSLyYbEle1fwdDCyk1HawtrgmprFZP0-AVsCqR_0ovHtWx7buZKrA280iqm01bYMZJ-BwtG1f1hRofUn7QxXZ1k0gbAooMBzHP-_kkx0Vvg2V3UvjkyMTVXyySjNWftjwl3kAJz7CPCEypnDPu-UL5z-Zpw208VSAFeJnho1oxV3FmYYMbPNHjBXltJqfSjxy16g_5dZmrxP-G7FeAeAVyuDv_z54GZk',
        campus: 'วิทยาเขตหลัก',
      };
    }

    setCurrentUser(account);
    try {
      localStorage.setItem('user_profile', JSON.stringify(account));
    } catch (e) {
      // ignore
    }

    if (newRole === 'technician') {
      setCurrentView('tech-workspace');
    } else if (newRole === 'user') {
      setCurrentView('my-tickets');
    } else {
      setCurrentView('dashboard');
    }

    const label =
      newRole === 'admin'
        ? '🛡️ แอดมิน (Super Admin - อำนาจสูงสุด)'
        : newRole === 'technician'
        ? '🛠️ ช่างเทคนิค (IT Technician)'
        : '👤 ผู้ใช้บริการ (User / Staff)';

    showToast('สลับบทบาทเรียบร้อย', `เข้าสู่โหมด ${label} (${account.name})`, 'info');
  };

  // Toggle between 3 roles in cycle: admin -> technician -> user -> admin
  const handleToggleRole = () => {
    if (currentUser.role === 'admin') {
      handleSwitchRole('technician');
    } else if (currentUser.role === 'technician') {
      handleSwitchRole('user');
    } else {
      handleSwitchRole('admin');
    }
  };

  // Find currently selected ticket or fallback to first
  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Filter tickets for "My Tickets" view (claimed by me or submitted by me)
  const myTickets = tickets.filter((t) => {
    if (currentUser.role === 'technician') {
      if (t.assignedTech === currentUser.name) return true;
      if (currentUser.techCode && t.assignedTech?.includes(currentUser.techCode)) return true;
      return false;
    }
    if (currentUser.role === 'user') {
      return (
        t.requesterName === currentUser.name ||
        t.requesterEmail === currentUser.email
      );
    }
    // Admin sees tickets they claimed or requested
    return (
      t.assignedTech === currentUser.name ||
      t.requesterName === currentUser.name ||
      t.requesterEmail === currentUser.email
    );
  });

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
        onSwitchRole={handleSwitchRole}
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
          onSwitchRole={handleSwitchRole}
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

          {currentView === 'tech-workspace' && (
            <TechWorkspaceView
              tickets={tickets}
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onClaimTicket={handleClaimTicket}
              onUpdateStatus={handleUpdateStatus}
              onShowToast={showToast}
            />
          )}

          {currentView === 'admin-center' && (
            <AdminCenterView
              tickets={tickets}
              technicians={technicians}
              currentUser={currentUser}
              theme={theme}
              onNavigate={handleNavigate}
              onClearAllTickets={handleClearAllTickets}
              onLoadSampleTickets={handleLoadSampleTickets}
              onShowToast={showToast}
              onSwitchRole={handleSwitchRole}
              onAddTechnician={handleAddTechnician}
              onDeleteTechnician={handleDeleteTechnician}
              onUpdateTechnician={handleUpdateTechnician}
              onUpdateTechStatus={handleUpdateTechStatus}
            />
          )}

          {currentView === 'users' && (
            <UsersView
              technicians={technicians}
              currentUser={currentUser}
              theme={theme}
              onUpdateTechStatus={handleUpdateTechStatus}
              onAddTechnician={handleAddTechnician}
              onDeleteTechnician={handleDeleteTechnician}
              onUpdateTechnician={handleUpdateTechnician}
              onShowToast={showToast}
              onNavigate={handleNavigate}
              onSwitchRole={handleSwitchRole}
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
