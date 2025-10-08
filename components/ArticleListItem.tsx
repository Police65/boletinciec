import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import ProxiedImage from './ProxiedImage';

interface ArticleListItemProps {
  article: Article;
}

const ArticleListItem: React.FC<ArticleListItemProps> = ({ article }) => {
  return (
    <div className="p-4">
      <Link to={`/article/${article.id}`} className="flex items-stretch justify-between gap-4 rounded-lg group">
        <div className="flex flex-col gap-1 flex-[2_2_0px]">
          <p className="text-[#111418] text-base font-bold leading-tight group-hover:text-blue-600">
            {article.title}
          </p>
          <p className="text-[#637588] text-sm font-normal leading-normal line-clamp-2">
            {article.summary}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(article.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1 overflow-hidden">
             <ProxiedImage src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
      </Link>
    </div>
  );
};

export default ArticleListItem;