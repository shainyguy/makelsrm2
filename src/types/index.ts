export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'potential';
  birthday?: string;
  contractEndDate?: string;
  inn?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Shipment {
  id: string;
  clientId: string;
  date: string;
  products: string;
  amount: number;
  status: 'planned' | 'in_progress' | 'shipped' | 'delivered';
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface Deal {
  id: string;
  clientId: string;
  title: string;
  amount: number;
  stage: 'lead' | 'negotiation' | 'proposal' | 'contract' | 'won' | 'lost';
  probability: number;
  createdAt: string;
  notes: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'call' | 'meeting' | 'email' | 'message';
  date: string;
  notes: string;
  result?: string;
  duration?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'revenue' | 'shipments' | 'clients' | 'calls' | 'meetings';
  target: number;
  current: number;
  period: 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
}

export interface ManagerProfile {
  name: string;
  position: string;
  email: string;
  phone: string;
  avatar?: string;
  startDate: string;
}

export interface Reminder {
  id: string;
  clientId?: string;
  type: 'no_order' | 'birthday' | 'contract_end' | 'custom';
  message: string;
  date: string;
  dismissed: boolean;
}

export type ViewType = 'dashboard' | 'calendar' | 'clients' | 'deals' | 'tasks' | 'analytics' | 'interactions' | 'goals' | 'products' | 'documents' | 'reminders' | 'profile';

export type ThemeMode = 'light' | 'dark';
