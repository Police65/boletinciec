import React, { useEffect } from 'react';
import type { Article } from '../types';
import { Link } from 'react-router-dom';
import ProxiedImage from './ProxiedImage';
import { decodeHTMLEntities } from '../utils';

interface CarouselProps {
  articles: Article[];
}

const Carousel: React.FC<CarouselProps> = ({ articles }) => {
  useEffect(() => {
    // Flowbite's JS is loaded globally, but React renders components dynamically.
    // We need to manually initialize the carousel after the component and its data are rendered.
    // The `initFlowbite` function scans the DOM for new elements that need JS listeners.
    if ('initFlowbite' in window && typeof (window as any).initFlowbite === 'function') {
        (window as any).initFlowbite();
    }
  }, [articles]);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div id="default-carousel" className="relative w-full" data-carousel="slide" data-carousel-interval="3000">
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
        {articles.map((article, index) => (
          <div key={article.id} className="hidden duration-700 ease-in-out" data-carousel-item>
             <Link to={`/article/${article.id}`} className="absolute block w-full h-full top-0 left-0">
                <ProxiedImage src={article.image_url} className="absolute block w-full h-full object-cover" alt={decodeHTMLEntities(article.title)} />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-8">
                    <h2 className="text-white text-3xl font-bold">{decodeHTMLEntities(article.title)}</h2>
                    <p className="text-gray-200 mt-2 hidden md:block">{decodeHTMLEntities(article.summary)}</p>
                </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
        {articles.map((_, index) => (
          <button
            key={index}
            type="button"
            className="w-3 h-3 rounded-full"
            aria-current={index === 0}
            aria-label={`Slide ${index + 1}`}
            data-carousel-slide-to={index}
          ></button>
        ))}
      </div>
      <button type="button" className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button type="button" className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
};

export default Carousel;