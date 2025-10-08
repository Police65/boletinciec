import React from 'react';
import type { Article } from '../types';
import { Link } from 'react-router-dom';
import ProxiedImage from './ProxiedImage';

interface NewsCardProps {
  article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <Link to={`/article/${article.id}`} className="flex h-full flex-1 flex-col gap-4 rounded-lg group">
      <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col overflow-hidden">
         <ProxiedImage src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{new Date(article.created_at).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h3 className="text-[#111418] text-base font-medium leading-normal group-hover:text-blue-600">{article.title}</h3>
        <p className="text-[#637588] text-sm font-normal leading-normal line-clamp-2">{article.summary}</p>
      </div>
    </Link>
  );
};

export default NewsCard;