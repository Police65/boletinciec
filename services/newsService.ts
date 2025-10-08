import { supabase } from './supabaseClient';
import type { Article, Category } from '../types';
import { ArticleStatus } from '../types';

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
    // This function will now only return categories that have at least one 'approved' or 'pending' article.
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
        const category = item.category;
        // Ensure category and category.id are not null before setting and check for duplicates
        if (category && category.id != null && !categoriesMap.has(category.id)) {
            categoriesMap.set(category.id, { id: category.id, name: category.name });
        }
    }

    const uniqueCategories = Array.from(categoriesMap.values());
    // Sort them by name for consistent display
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

/**
 * Prepends a CORS proxy URL to an image URL to prevent cross-origin issues,
 * particularly for rendering in environments like html2canvas.
 * @param url The original image URL.
 * @returns The proxied image URL.
 */
export const getProxiedImageUrl = (url: string): string => {
    if (!url || typeof url !== 'string') {
        return '';
    }
    // Don't proxy data URLs or already proxied URLs.
    if (url.startsWith('data:') || url.includes('images.weserv.nl')) {
        return url;
    }
    // Using images.weserv.nl as a reliable CORS proxy for images.
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};