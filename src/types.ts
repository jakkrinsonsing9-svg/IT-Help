export type TicketStatus =
  | 'Pending'
  | 'Accepted'
  | 'In Progress'
  | 'Waiting'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Computer'
  | 'Network'
  | 'Software'
  | 'Printer'
  | 'Account'
  | 'Other';

export interface TicketComment {
  id: string;
  senderName: string;
  senderRole: string;
  time: string;
  text: string;
  isTech: boolean;
  avatar?: string;
  attachmentName?: string;
}

export interface TicketTimelineStep {
  id: string;
  title: string;
  time: string;
  desc: string;
  statusText: string;
  icon: string;
  completed: boolean;
  isCurrent?: boolean;
}

export interface TicketAttachment {
  name: string;
  size: string;
  time: string;
  url: string;
  previewUrl?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  requesterDept: string;
  requesterTitle?: string;
  requesterAvatar?: string;
  location: string;
  roomDetails: string;
  assetTag: string;
  assetDevice: string;
  impact: string;
  createdAt: string;
  createdAtRelative: string;
  slaTargetHours?: number;
  slaRemainingText?: string;
  assignedTech?: string;
  assignedTechTitle?: string;
  assignedTechAvatar?: string;
  assignedTechExt?: string;
  assignedTechPhone?: string;
  spareEquipmentNote?: string;
  attachments: TicketAttachment[];
  timeline: TicketTimelineStep[];
  comments: TicketComment[];
}

export interface Technician {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  location: string;
  status: 'available' | 'busy' | 'remote';
  activeLoad: number;
  avatar: string;
  extension: string;
  phone: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  roleLabel: string;
  department: string;
  phone: string;
  avatar: string;
  campus: string;
}

export type ActiveView =
  | 'dashboard'
  | 'all-tickets'
  | 'my-tickets'
  | 'new-ticket'
  | 'ticket-detail'
  | 'users'
  | 'profile'
  | 'auth';

export type AppTheme = 'modern' | 'neumorphic';
