import React, { useEffect, useState } from 'react';
import { getDailyIndicators } from '../services/newsService';
import { DailyIndicator } from '../types';

const BCVWidget: React.FC = () => {
    const [dolar, setDolar] = useState<DailyIndicator | null>(null);
    const [euro, setEuro] = useState<DailyIndicator | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDailyIndicators();
                // Find latest BCV indicators
                // We assume getDailyIndicators returns them ordered by date descending
                const bcvDolar = data.find(i => i.type === 'currency' && i.name === 'Dolar BCV');
                const bcvEuro = data.find(i => i.type === 'currency' && i.name === 'Euro BCV');

                if (bcvDolar) setDolar(bcvDolar);
                if (bcvEuro) setEuro(bcvEuro);
            } catch (error) {
                console.error('Error fetching BCV indicators:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Refresh every 30 minutes
        const interval = setInterval(fetchData, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!dolar && !euro) return null;

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-VE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return dateStr;
        }
    };

    const latestUpdate = dolar?.created_at || euro?.created_at || new Date().toISOString();

    return (
        <div className="bg-[#fafbfc] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#eef1f4] overflow-hidden sticky top-24">
            {/* Header with Softer Slate Palette */}
            <div className="relative bg-[#334155] p-5 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8895a7]">Tipo de Cambio</h3>
                    </div>
                    <h2 className="text-lg font-bold font-newsreader leading-tight">Mercado Oficial BCV</h2>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>

            <div className="p-5">
                {/* Values */}
                <div className="space-y-4">
                    {dolar && (
                        <div className="relative group">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#eef1f4] group-hover:border-[#FFD700]/40 group-hover:bg-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Dólar Estadounidense</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-[#111418] tracking-tighter">
                                            {typeof dolar.value === 'string' ? parseFloat(dolar.value).toFixed(2) : dolar.value.toFixed(2)}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 font-mono">Bs.</span>
                                    </div>
                                </div>
                                <div className="bg-[#f8f9fa] w-10 h-10 rounded-lg flex items-center justify-center border border-[#eef1f4] group-hover:scale-110 transition-transform">
                                    <span className="text-lg" role="img" aria-label="USA Flag">🇺🇸</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {euro && (
                        <div className="relative group">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#eef1f4] group-hover:border-[#FFD700]/40 group-hover:bg-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Euro (Unión Europea)</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-[#111418] tracking-tighter">
                                            {typeof euro.value === 'string' ? parseFloat(euro.value).toFixed(2) : euro.value.toFixed(2)}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 font-mono">Bs.</span>
                                    </div>
                                </div>
                                <div className="bg-[#f8f9fa] w-10 h-10 rounded-lg flex items-center justify-center border border-[#eef1f4] group-hover:scale-110 transition-transform">
                                    <span className="text-lg" role="img" aria-label="EU Flag">🇪🇺</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Message */}
                <div className="mt-6 flex items-start gap-2 px-1">
                    <svg className="w-3 h-3 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] text-[#637588] leading-relaxed font-medium">
                        Tasa de referencia oficial publicada por el Banco Central de Venezuela.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-[#eef1f4]">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Última Actualización</span>
                            <span className="text-[11px] text-[#111418] font-bold leading-tight">
                                {formatDate(latestUpdate)}
                            </span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BCVWidget;
