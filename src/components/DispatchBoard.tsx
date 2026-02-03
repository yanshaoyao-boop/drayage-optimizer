"use client";

import React, { useState } from 'react';
import { ContainerJob, Driver } from '@/types';
import { MOCK_JOBS, MOCK_DRIVERS, getJobUrgency } from '@/lib/dispatchData';
import { Truck, Clock, AlertTriangle, CheckCircle, MapPin, Calendar, User, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export const DispatchBoard = () => {
    const [jobs, setJobs] = useState<ContainerJob[]>(MOCK_JOBS);
    const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
    const [filter, setFilter] = useState('ALL');

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'Expired': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
            case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const pendingJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'DISPATCHED');

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">调度控制塔</h1>
                        <p className="text-xs text-slate-500">Dispatch Control Tower - {format(new Date(), 'yyyy-MM-dd')}</p>
                    </div>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
                        <AlertTriangle size={14} />
                        <span>急需派送: {pendingJobs.filter(j => getJobUrgency(j.lfdTerminal) === 'Critical').length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        <User size={14} />
                        <span>可用司机: {drivers.filter(d => d.status === 'IDLE').length}</span>
                    </div>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Job Pool */}
                <div className="w-2/3 flex flex-col border-r border-slate-200 bg-white">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-slate-700 flex items-center gap-2">
                            待派送柜列表 ({pendingJobs.length})
                        </h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="搜柜号/提单号..."
                                    className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200">
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {pendingJobs
                            .sort((a, b) => new Date(a.lfdTerminal).getTime() - new Date(b.lfdTerminal).getTime())
                            .map(job => {
                                const urgency = getJobUrgency(job.lfdTerminal);
                                const isRemote = job.destination === 'GYR3' || job.destination === 'LAS7' || job.destination === 'SMF3'; // Simple Mock check

                                return (
                                    <div key={job.id} className={`group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${job.status === 'DISPATCHED' ? 'opacity-75' : ''}`}>
                                        {/* Status Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgency === 'Critical' ? 'bg-red-500' :
                                                urgency === 'High' ? 'bg-orange-400' : 'bg-green-400'
                                            }`}></div>

                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg text-slate-800">{job.containerNo}</span>
                                                <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">{job.size}' {job.type}</span>
                                                {isRemote && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 rounded">REMOTE</span>}
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${getUrgencyColor(urgency)}`}>
                                                <Clock size={12} />
                                                LFD: {job.lfdTerminal} ({urgency})
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pl-2 mb-2">
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">提货地</label>
                                                <div className="text-sm font-semibold text-slate-700">{job.origin}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">目的地 (仓库)</label>
                                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                                    <MapPin size={12} className="text-indigo-500" />
                                                    {job.destination}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">客户单号</label>
                                                <div className="text-sm text-slate-600">{job.customerRef}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pl-2 pt-2 border-t border-slate-50">
                                            <span className="text-xs text-slate-400 font-mono">MBL: {job.masterBL}</span>
                                            {job.status === 'DISPATCHED' ? (
                                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                    <User size={12} /> 被 {job.assignedDriverId} 承运中
                                                </span>
                                            ) : (
                                                <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm">
                                                    派单 (Dispatch)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Right Panel: Driver Fleet */}
                <div className="w-1/3 bg-slate-50 flex flex-col border-l border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h2 className="font-bold text-slate-700 flex items-center gap-2">
                            司机状态 ({drivers.length})
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${driver.status === 'HAULING_LOAD' ? 'bg-indigo-100 text-indigo-600' :
                                                driver.status === 'IDLE' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-slate-100 text-slate-400'
                                            }`}>
                                            {driver.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{driver.name}</div>
                                            <div className="text-xs text-slate-500">{driver.phone} • {driver.licensePlate}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${driver.status === 'IDLE' ? 'bg-emerald-100 text-emerald-700' :
                                            driver.status === 'OFF_DUTY' ? 'bg-slate-100 text-slate-500' :
                                                'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {driver.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {driver.location && (
                                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 bg-slate-50 p-1.5 rounded">
                                        <MapPin size={10} />
                                        <span>当前位置: {driver.location}</span>
                                    </div>
                                )}
                                {driver.currentJobId && (
                                    <div className="mt-2 text-xs font-medium text-indigo-600 border-t border-slate-100 pt-2">
                                        正在运输任务: {driver.currentJobId}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
