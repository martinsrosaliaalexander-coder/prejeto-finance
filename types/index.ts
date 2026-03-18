export type TransactionType = 'entrada' | 'saida';
export type TransactionStatus = 'recebido' | 'pendente' | 'pago';

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  status: TransactionStatus;
  client: string | null;
  created_at?: string;
}

export interface SummaryTotals {
  income: number;
  expense: number;
  balance: number;
  pending: number;
}
