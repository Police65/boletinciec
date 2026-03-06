import React, { useEffect, useState } from 'react';
import { getDailyIndicators } from '../services/newsService';
import { DailyIndicator } from '../types';

const getTypeConfig = (type: string, name: string) => {
    const n = name.toLowerCase();
    const t = (type || '').toLowerCase();

    // Check for BCV/Currency indicators specifically
    // Check for BCV/Currency indicators specifically using the 'type' field
    if (t === 'currency' || n.includes('bcv')) {
        return {
            label: 'BCV',
            color: 'text-[#FFD700]',
            bg: 'bg-[#FFD700]/10',
            dot: 'bg-[#FFD700]'
        };
    }

    switch (t) {
        case 'crypto':
            return {
                label: 'CRIPTO',
                color: 'text-[#F7931A]',
                bg: 'bg-[#F7931A]/10',
                dot: 'bg-[#F7931A]'
            };
        case 'stock':
            return {
                label: 'ACCIONES',
                color: 'text-[#00BCD4]',
                bg: 'bg-[#00BCD4]/10',
                dot: 'bg-[#00BCD4]'
            };
        case 'index':
            return {
                label: 'ÍNDICE',
                color: 'text-[#E91E63]',
                bg: 'bg-[#E91E63]/10',
                dot: 'bg-[#E91E63]'
            };
        default:
            return {
                label: t ? t.toUpperCase() : 'INDICADOR',
                color: 'text-[#00C853]',
                bg: 'bg-[#00C853]/10',
                dot: 'bg-[#00C853]'
            };
    }
};

const IndicatorTicker: React.FC = () => {
    const [indicators, setIndicators] = useState<DailyIndicator[]>([]);

    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                const data = await getDailyIndicators();
                setIndicators(data);
            } catch (error) {
                console.error('Error in IndicatorTicker:', error);
            }
        };
        fetchIndicators();
    }, []);

    if (indicators.length === 0) return null;

    const renderIndicators = (isDup: boolean = false) => (
        <div className="flex animate-marquee">
            {indicators.map((indicator) => {
                const config = getTypeConfig(indicator.type, indicator.name);
                return (
                    <div key={`${indicator.id}${isDup ? '-dup' : ''}`} className="flex items-center mx-8">
                        {/* Type Label */}
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-tighter mr-2.5 ${config.bg} ${config.color} border border-current opacity-80`}>
                            {config.label}
                        </span>

                        {/* Name */}
                        <span className="text-[13px] font-bold text-gray-100 uppercase tracking-tight mr-2 group-hover/ticker:text-white transition-colors">
                            {indicator.name}
                        </span>

                        {/* Value */}
                        <span className="text-[14px] font-black text-white font-mono flex items-center">
                            <span className="opacity-40 mr-0.5 text-[10px]">$</span>
                            {typeof indicator.value === 'string' ? parseFloat(indicator.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : indicator.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>

                        {/* Decorative Dot */}
                        <div className={`ml-4 w-1 h-1 rounded-full ${config.dot} opacity-20`}></div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="w-full bg-[#475569] border-y border-[#64748b]/30 py-2 overflow-hidden relative group/ticker shadow-xl">
            {/* Edge Gradients for smooth fade */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#475569] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#475569] to-transparent z-10 pointer-events-none"></div>

            <div className="flex whitespace-nowrap">
                {renderIndicators(false)}
                {renderIndicators(true)}
            </div>
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group\/ticker:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default IndicatorTicker;
