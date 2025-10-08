
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
