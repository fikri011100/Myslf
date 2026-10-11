/**
 * Tipe domain AIO-Tracker (selaras dengan PRD §9 Model Data).
 * Nantinya dapat digenerate otomatis via `supabase gen types typescript`.
 */

export type Role = "member" | "admin" | "super_admin";
export type TaskPriority = "low" | "medium" | "high";
export type TaskDifficulty = "low" | "medium" | "high";
export type TransactionType = "income" | "expense";

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface CompanyMember {
  company_id: string;
  user_id: string;
  role: Role;
}

export interface Board {
  id: string;
  company_id: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  created_at: string;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  number: number;
  title: string;
  description: string | null;
  customer: string | null;
  status: string | null;
  difficulty: TaskDifficulty | null;
  priority: TaskPriority | null;
  due_date: string | null;
  assignee_id: string | null;
  assignee_name?: string | null;
  position: number;
  done_at: string | null;
  chatwoot_conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  company_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface FormDefinition {
  id: string;
  company_id: string;
  title: string;
  schema: unknown;
  is_public: boolean;
  created_at: string;
}

export interface DmConversation {
  id: string;
  name: string;
  email: string;
  last_body: string | null;
  last_at: string | null;
  unread: number;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  role: Role;
}
