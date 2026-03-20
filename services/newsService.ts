
import { supabase } from './supabaseClient';
import type { Article, Category, FinancialIndicator, DailyIndicator } from '../types';
import { ArticleStatus } from '../types';

export const getDailyIndicators = async (): Promise<DailyIndicator[]> => {
  const { data, error } = await supabase
    .from('daily_indicators')
    .select('*')
    .order('date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching daily indicators:', error);
    return [];
  }

  const latestIndicatorsMap = new Map<string, DailyIndicator>();

  if (data && data.length > 0) {
    data.forEach(indicator => {
      const key = indicator.name.toLowerCase();
      if (!latestIndicatorsMap.has(key)) {
        latestIndicatorsMap.set(key, indicator);
      }
    });
  }

  return Array.from(latestIndicatorsMap.values());
};

export const getFinancialIndicators = async (): Promise<FinancialIndicator[]> => {
  const { data, error } = await supabase
    .from('financial_indicators')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching financial indicators:', error);
    return [];
  }

  return data as FinancialIndicator[];
};

export const getVisibleArticles = async (options: { categoryId?: number; limit?: number; page?: number; pageSize?: number } = {}): Promise<Article[]> => {
  const { categoryId, limit, page = 1, pageSize } = options;

  let query = supabase
    .from('articles')
    .select('*, category:categories(id, name)')
    .in('status', [ArticleStatus.Approved, ArticleStatus.Pending])
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (pageSize) {
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching visible articles:', error);
    throw error;
  }

  return data as Article[];
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article by ID:', error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Article | null;
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Category | null;
}

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('category:categories(id, name)')
    .in('status', [ArticleStatus.Approved, ArticleStatus.Pending]);

  if (error) {
    console.error('Error fetching non-empty categories:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  const categoriesMap = new Map<number, Category>();
  for (const item of data) {
    const category = item.category as any;
    if (category) {
      // Handle case where category might be returned as an array or object
      const catObj = Array.isArray(category) ? category[0] : category;
      if (catObj && catObj.id != null && !categoriesMap.has(catObj.id)) {
        categoriesMap.set(catObj.id, { id: catObj.id, name: catObj.name });
      }
    }
  }

  const uniqueCategories = Array.from(categoriesMap.values());
  uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));

  return uniqueCategories;
};

export const getPendingArticles = async (): Promise<Article[]> => {
  let query = supabase
    .from('articles')
    .select('*, category:categories(id, name)')
    .eq('status', ArticleStatus.Pending)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pending articles:', error);
    throw error;
  }

  return data as Article[];
};

export const updateArticleStatus = async (id: string, status: ArticleStatus): Promise<Article> => {
  const { data, error } = await supabase
    .from('articles')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article status:', error);
    throw error;
  }

  return data as Article;
}

export const getWeeklyApprovedArticles = async (): Promise<Article[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, name)')
    .eq('status', ArticleStatus.Approved)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('category_id', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching weekly approved articles:', error);
    throw error;
  }

  return data as Article[];
};

export const getApprovedArticlesByDateRange = async (startDate: string, endDate: string): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, name)')
    .eq('status', ArticleStatus.Approved)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('category_id', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching approved articles by date range:', error);
    throw error;
  }

  return data as Article[];
};

export const getProxiedImageUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  if (url.startsWith('data:') || url.includes('images.weserv.nl')) {
    return url;
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};
