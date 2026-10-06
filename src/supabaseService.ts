import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, TicketStatus } from './types';

export const DEFAULT_SUPABASE_URL = 'https://ronqdmeqfvqrmgkmzchg.supabase.co';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') || '' : '';
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_project_url') || '' : '';

  const url = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = storedKey || envKey || '';

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

let cachedClient: SupabaseClient | null = null;
let lastUsedKey = '';
let lastUsedUrl = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) return null;

  if (cachedClient && lastUsedKey === anonKey && lastUsedUrl === url) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastUsedKey = anonKey;
    lastUsedUrl = url;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const SQL_MIGRATION_SCRIPT = `-- ==========================================
-- IT Help Project (Nexus Desk) - Supabase Schema
-- Project: https://ronqdmeqfvqrmgkmzchg.supabase.co
-- ==========================================

-- 1. Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT,
  requester_email TEXT,
  requester_dept TEXT,
  requester_title TEXT,
  location TEXT,
  room_details TEXT,
  asset_tag TEXT,
  asset_device TEXT,
  impact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_at_relative TEXT,
  assigned_tech TEXT,
  spare_equipment_note TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 3. Create Public access policies for internal staff portal (idempotent)
DROP POLICY IF EXISTS "Public Read Access" ON public.tickets;
CREATE POLICY "Public Read Access" 
ON public.tickets FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Public Insert Access" ON public.tickets;
CREATE POLICY "Public Insert Access" 
ON public.tickets FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Access" ON public.tickets;
CREATE POLICY "Public Update Access" 
ON public.tickets FOR UPDATE 
TO anon, authenticated 
USING (true);
`;

export const convertDbToTicket = (row: any): Ticket => {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    priority: row.priority,
    status: row.status,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone || '',
    requesterEmail: row.requester_email || '',
    requesterDept: row.requester_dept || '',
    requesterTitle: row.requester_title,
    location: row.location || '',
    roomDetails: row.room_details || '',
    assetTag: row.asset_tag || '',
    assetDevice: row.asset_device || '',
    impact: row.impact || '',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('th-TH') : '',
    createdAtRelative: row.created_at_relative || 'เมื่อสักครู่',
    assignedTech: row.assigned_tech,
    spareEquipmentNote: row.spare_equipment_note,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
  };
};

export const convertTicketToDb = (ticket: Ticket) => {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    requester_name: ticket.requesterName,
    requester_phone: ticket.requesterPhone,
    requester_email: ticket.requesterEmail,
    requester_dept: ticket.requesterDept,
    requester_title: ticket.requesterTitle,
    location: ticket.location,
    room_details: ticket.roomDetails,
    asset_tag: ticket.assetTag,
    asset_device: ticket.assetDevice,
    impact: ticket.impact,
    created_at_relative: ticket.createdAtRelative,
    assigned_tech: ticket.assignedTech,
    spare_equipment_note: ticket.spareEquipmentNote,
    attachments: ticket.attachments,
    timeline: ticket.timeline,
    comments: ticket.comments,
  };
};

// Fetch tickets from Supabase
export const fetchTicketsFromSupabase = async (): Promise<Ticket[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(convertDbToTicket);
    }
    return [];
  } catch (e) {
    console.error('Supabase exception:', e);
    return null;
  }
};

// Insert a ticket to Supabase
export const insertTicketToSupabase = async (ticket: Ticket): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbPayload = convertTicketToDb(ticket);
    const { error } = await client.from('tickets').insert([dbPayload]);
    if (error) {
      console.error('Supabase insert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase insert exception:', e);
    return false;
  }
};

// Update ticket status in Supabase
export const updateTicketInSupabase = async (
  ticketId: string,
  updates: Partial<Ticket>
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.assignedTech !== undefined) dbUpdates.assigned_tech = updates.assignedTech;
    if (updates.timeline) dbUpdates.timeline = updates.timeline;
    if (updates.comments) dbUpdates.comments = updates.comments;
    if (updates.spareEquipmentNote !== undefined) dbUpdates.spare_equipment_note = updates.spareEquipmentNote;

    const { error } = await client.from('tickets').update(dbUpdates).eq('id', ticketId);
    if (error) {
      console.error('Supabase update error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase update exception:', e);
    return false;
  }
};

// Seed initial mock tickets to Supabase
export const seedTicketsToSupabase = async (initialTickets: Ticket[]): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Supabase client is not configured' };

  try {
    const dbPayloads = initialTickets.map(convertTicketToDb);
    const { error, count } = await client.from('tickets').upsert(dbPayloads, { onConflict: 'id' });
    if (error) {
      return { success: false, count: 0, error: error.message };
    }
    return { success: true, count: initialTickets.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Unknown error' };
  }
};

// Clear all tickets from Supabase
export const clearAllTicketsInSupabase = async (): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client is not configured' };

  try {
    const { error } = await client.from('tickets').delete().neq('id', '___non_existent___');
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
};
