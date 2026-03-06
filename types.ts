
export enum ArticleStatus {
  Pending = 'pendiente',
  Approved = 'aprobado',
  Rejected = 'rechazado',
}

export interface Article {
  id: string;
  created_at: string;
  title: string;
  summary: string;
  body: string;
  image_url: string;
  category_id: number;
  status: ArticleStatus;
  source_url?: string;
  category?: Category; // For joined data
}

export interface Category {
  id: number;
  name: string;
}

export interface FinancialIndicator {
  id: string;
  price: number;
  variation: number;
  updated_at: string;
}
export interface DailyIndicator {
  id: number;
  created_at: string;
  date: string;
  name: string;
  value: number;
  type: string;
}
