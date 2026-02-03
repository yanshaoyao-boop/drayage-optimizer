"use client";

import React, { useState } from 'react';
import { getEnrichedWarehouses } from '@/lib/logic';
import { Warehouse } from '@/types';
import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

export const CongestionMonitor = () => {
    const warehouses = getEnrichedWarehouses();
    const [filter, setFilter] = useState<'All' | 'Critical'>('All');

    const displayedWh = filter === 'All'
        ? warehouses
        : warehouses.filter(w => w.congestionLevel === 'Critical');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    拥堵实时监控 (Congestion Watch)
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('All')}
                        className={clsx("px-3 py-1 rounded-full text-sm", filter === 'All' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600")}
                    >
                        全部 (All)
                    </button>
                    <button
                        onClick={() => setFilter('Critical')}
                        className={clsx("px-3 py-1 rounded-full text-sm", filter === 'Critical' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600")}
                    >
                        仅看红色预警
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {displayedWh.map((wh) => (
                    <div key={wh.code} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className={clsx("mt-1 p-2 rounded-lg",
                                wh.congestionLevel === 'Critical' ? 'bg-red-100 text-red-600' :
                                    wh.congestionLevel === 'High' ? 'bg-orange-100 text-orange-600' :
                                        'bg-green-100 text-green-600'
                            )}>
                                {wh.congestionLevel === 'Critical' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900">{wh.code} <span className="text-slate-400 font-normal text-sm ml-2">{wh.city}, {wh.state}</span></h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {wh.zip}</span>
                                    <span className="flex items-center gap-1">排队: {Math.floor((wh.avgWaitTimeMins || 0) / 60)}小时 {(wh.avgWaitTimeMins || 0) % 60}分</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={clsx("text-sm font-bold",
                                wh.congestionLevel === 'Critical' ? 'text-red-500' : 'text-slate-500'
                            )}>
                                {wh.congestionLevel === 'Critical' ? '严重拥堵' :
                                    wh.congestionLevel === 'High' ? '较为拥堵' :
                                        wh.congestionLevel === 'Medium' ? '中等' : '通畅'}
                            </div>
                            {wh.congestionLevel === 'Critical' && (
                                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-1">
                                    建议避开 / 附加费
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
