import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { Category } from '../types';
import { getCategories } from '../services/newsService';
import { CIEC_LOGO_URL } from '../assets';

const Header: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories for header:", error);
      }
    };
    fetchCategories();
  }, []);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      if (!hasOverflow) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      const isScrolledToStart = container.scrollLeft <= 0;
      const isScrolledToEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
      
      setCanScrollLeft(!isScrolledToStart);
      setCanScrollRight(!isScrolledToEnd);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener('scroll', checkScrollability, { passive: true });
      
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        resizeObserver.disconnect();
      };
    }
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `text-sm font-medium leading-normal whitespace-nowrap py-2 transition-colors duration-200 hover:text-blue-600 ${isActive ? "text-blue-600" : "text-[#111418]"}`;

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-10 py-3 sticky top-0 bg-white z-50">
      <div className="flex items-center gap-8 min-w-0">
        <Link to="/" className="flex items-center gap-3 text-[#111418] flex-shrink-0">
          <img src={CIEC_LOGO_URL} alt="CIEC Logo" className="h-10 w-auto" />
          <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] font-newsreader">CIEC Noticias</h2>
        </Link>
        <nav className="hidden md:flex items-center gap-9 min-w-0">
          <NavLink to="/" className={navLinkClasses} end>Inicio</NavLink>
          <NavLink to="/newsletter" className={navLinkClasses}>Boletín</NavLink>
          
          <div className="relative flex-1 flex items-center min-w-[100px]">
            <div 
              ref={scrollContainerRef} 
              className="flex items-center gap-9 overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
              {categories.map(category => (
                <NavLink key={category.id} to={`/category/${category.id}`} className={navLinkClasses}>{category.name}</NavLink>
              ))}
            </div>

            <div className={`absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-white to-transparent pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-white to-transparent pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}></div>

            {canScrollLeft && (
              <button 
                onClick={() => handleScroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-gray-100 transition"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M160,216a8,8,0,0,1-5.66-2.34l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128l74.35,74.34A8,8,0,0,1,160,216Z"></path></svg>
              </button>
            )}
            {canScrollRight && (
              <button 
                onClick={() => handleScroll('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-gray-100 transition"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M96,216a8,8,0,0,1-5.66-13.66L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80a8,8,0,0,1,0,11.32l-80,80A8,8,0,0,1,96,216Z"></path></svg>
              </button>
            )}
          </div>
        </nav>
      </div>
      <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-4">
        <label className="flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#637588] flex border-none bg-[#f0f2f4] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input placeholder="Search" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] h-full placeholder:text-[#637588] px-4 pl-2 text-sm font-normal leading-normal" />
          </div>
        </label>
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <div className="text-[#111418]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
          </div>
        </button>
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-300"></div>
      </div>
       <div className="md:hidden">
            <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="navbar-default" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
      </div>
      <div className="hidden w-full md:hidden" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50">
             <li><Link to="/" className="block py-2 px-3 rounded hover:bg-gray-100">Inicio</Link></li>
             <li><Link to="/newsletter" className="block py-2 px-3 rounded hover:bg-gray-100">Boletín</Link></li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.id}`} className="block py-2 px-3 rounded hover:bg-gray-100">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
    </header>
  );
};

export default Header;
