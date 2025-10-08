import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Article, Category } from '../types';
import { getVisibleArticles, getCategoryById } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import Spinner from '../components/Spinner';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageData = async () => {
      if (categoryId) {
        try {
          setLoading(true);
          const numericCategoryId = Number(categoryId);
          
          const [categoryData, articlesData] = await Promise.all([
            getCategoryById(numericCategoryId),
            getVisibleArticles({ categoryId: numericCategoryId }),
          ]);

          setCategory(categoryData);
          setArticles(articlesData);

        } catch (err) {
          setError('Failed to fetch news for this category.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPageData();
  }, [categoryId]);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-[28px] font-bold mb-8 border-b-2 border-gray-200 pb-2 font-newsreader">
        {category ? category.name : 'Categoría Desconocida'}
      </h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay noticias en esta categoría todavía.</p>
      )}
    </div>
  );
};

export default CategoryPage;