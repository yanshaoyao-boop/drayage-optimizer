"use client";

import React, { useState, useEffect } from 'react';
import { Warehouse, QuoteResult, VehicleType, HandlingMethod } from '@/types';
import warehouseData from '@/data/us_warehouses.json';
import { calculateQuote, getEnrichedWarehouses, PORTS, getRealDistance } from '@/lib/logic';
import { Calculator, DollarSign, Truck, AlertTriangle, Ship, Loader2, Package, Layers, Search, MapPin } from 'lucide-react';

export const QuoteCalculator = () => {
    const [selectedPort, setSelectedPort] = useState<string>(PORTS[0].code);
    const [selectedCode, setSelectedCode] = useState<string>(warehouseData[0].code);
    const [vehicleType, setVehicleType] = useState<VehicleType>('DRY_VAN_53');
    const [handlingMethod, setHandlingMethod] = useState<HandlingMethod>('PALLETIZED');
    const [quote, setQuote] = useState<QuoteResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Advanced Options State
    const [chassisDays, setChassisDays] = useState(0);
    const [isOverweight, setIsOverweight] = useState(false);
    const [isHazmat, setIsHazmat] = useState(false);
    const [isPrePull, setIsPrePull] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredWarehouses = warehouseData.filter(wh =>
        wh.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wh.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const updateQuote = async () => {
            setLoading(true);
            const portInfo = PORTS.find(p => p.code === selectedPort);
            const whInfo = warehouseData.find(w => w.code === selectedCode);

            let realData = null;
            if (portInfo && whInfo) {
                const origin = `${portInfo.address}, ${portInfo.city}, ${portInfo.state}`;
                const destination = `${whInfo.address}, ${whInfo.city}, ${whInfo.state}`;
                realData = await getRealDistance(origin, destination);
            }

            const result = calculateQuote({
                origin: selectedPort,
                destinationCode: selectedCode,
                vehicleType,
                handlingMethod,
                chassisDays,
                isOverweight,
                isHazmat,
                isPrePull
            }, realData || undefined);

            setQuote(result);
            setLoading(false);
        };

        updateQuote();
    }, [selectedCode, selectedPort, vehicleType, handlingMethod, chassisDays, isOverweight, isHazmat, isPrePull]);

    const currentWh = getEnrichedWarehouses().find(w => w.code === selectedCode);
    const isCongested = currentWh?.congestionLevel === 'Critical' || currentWh?.congestionLevel === 'High';

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50 h-full relative overflow-hidden flex flex-col">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            )}

            <div className="flex items-center gap-2 mb-6 text-indigo-900 shrink-0">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calculator className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold">智能报价引擎 (Smart Quote)</h2>
            </div>

            <div className="space-y-6 shrink-0">
                {/* Row 1: Origins & Destinations */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">提货起点</label>
                        <select
                            value={selectedPort}
                            onChange={(e) => setSelectedPort(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {PORTS.map(port => (
                                <option key={port.code} value={port.code}>{port.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">送货目的地</label>
                        <div className="relative">
                            <div
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 flex justify-between items-center cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="flex items-center gap-2">
                                    {selectedCode}
                                    {warehouseData.find(w => w.code === selectedCode)?.isRemote && (
                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded animate-pulse">偏远</span>
                                    )}
                                </span>
                                <Search size={14} className="text-slate-400" />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    <div className="sticky top-0 p-2 bg-white border-b border-slate-100">
                                        <input
                                            type="text"
                                            placeholder="搜索仓库代码或城市..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full p-2 text-sm border border-slate-200 rounded outline-none focus:border-indigo-500"
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                    {filteredWarehouses.map(wh => (
                                        <div
                                            key={wh.code}
                                            className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                                            onClick={() => {
                                                setSelectedCode(wh.code);
                                                setIsDropdownOpen(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{wh.code}</span>
                                                <span className="text-[10px] text-slate-500">{wh.city}, {wh.state}</span>
                                            </div>
                                            {wh.isRemote && (
                                                <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded">偏远</span>
                                            )}
                                        </div>
                                    ))}
                                    {filteredWarehouses.length === 0 && (
                                        <div className="p-4 text-center text-xs text-slate-400">未找到匹配仓库</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Vehicle & Handling */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <Truck size={12} /> 车型选择
                        </label>
                        <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="CONTAINER_40">40' Container (海运柜)</option>
                            <option value="CONTAINER_20">20' Container (海运柜)</option>
                            <option value="DRY_VAN_53">53' Dry Van (大型干柜)</option>
                            <option value="BOX_TRUCK_26">26' Box Truck (中型卡车)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <Layers size={12} /> 装载方式
                        </label>
                        <select
                            value={handlingMethod}
                            onChange={(e) => setHandlingMethod(e.target.value as HandlingMethod)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="PALLETIZED">有托盘 (Palletized)</option>
                            <option value="FLOOR_LOADED">无托盘/散装 (Floor Loaded)</option>
                        </select>
                    </div>
                </div>

                {isCongested && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="text-amber-600 w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-amber-800 text-[11px] leading-tight">
                            <b>{selectedCode} 拥堵警报：</b>当前预计排队 {Math.floor((currentWh?.avgWaitTimeMins || 0) / 60)}h+。系统已自动调整滞留成本。
                        </p>
                    </div>
                )}

                {warehouseData.find(w => w.code === selectedCode)?.isRemote && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2">
                        <MapPin className="text-red-600 w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-red-800 text-[11px] leading-tight">
                            <b>偏远地区提醒：</b>{selectedCode} 属于亚马逊偏远/超偏远仓库。运输成本已包含偏远地区派送费。
                        </p>
                    </div>
                )}

                {/* Advanced Toggle */}
                <div className="border-t border-slate-50 pt-3">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                        {showAdvanced ? '- 收起费用选项' : '+ 展开高级费用 (车架/超重/预提)'}
                    </button>
                </div>

                {showAdvanced && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3 mt-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-600">车架租用 (Days)</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setChassisDays(Math.max(0, chassisDays - 1))} className="w-6 h-6 bg-white border rounded text-slate-500 hover:bg-slate-100">-</button>
                                <span className="text-sm font-bold w-4 text-center text-slate-700">{chassisDays}</span>
                                <button onClick={() => setChassisDays(chassisDays + 1)} className="w-6 h-6 bg-white border rounded text-slate-500 hover:bg-slate-100">+</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200 hover:border-indigo-200">
                                <input type="checkbox" checked={isOverweight} onChange={e => setIsOverweight(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                超重 (Overweight)
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200 hover:border-indigo-200">
                                <input type="checkbox" checked={isHazmat} onChange={e => setIsHazmat(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                危险品 (Hazmat)
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200 hover:border-indigo-200 col-span-2">
                                <input type="checkbox" checked={isPrePull} onChange={e => setIsPrePull(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                预提 (Pre-pull) - 夜间提货
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <hr className="my-6 border-slate-100" />

            {quote && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">精算里程 (Miles)</span>
                            <span className="text-sm font-bold text-slate-700">{quote.distanceMiles}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">预计周转 (Hrs)</span>
                            <span className="text-sm font-bold text-slate-700">{quote.estimatedHours.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>基础运输 (Driver+Truck)</span>
                            <span>${quote.baseCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>燃油附加费 (FSC)</span>
                            <span>${quote.fuelSurcharge.toFixed(2)}</span>
                        </div>
                        {quote.handlingFee > 0 && (
                            <div className="flex justify-between text-xs text-indigo-600 font-medium">
                                <span>人工搬运费 (Floor Load)</span>
                                <span>+${quote.handlingFee.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.chassisFee > 0 && (
                            <div className="flex justify-between text-xs text-indigo-600">
                                <span>车架费 ({chassisDays} days)</span>
                                <span>+${quote.chassisFee.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.overweightFee > 0 && (
                            <div className="flex justify-between text-xs text-orange-600">
                                <span>超重附加费 (Tri-axle)</span>
                                <span>+${quote.overweightFee.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.prePullFee > 0 && (
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>预提费 (Pre-pull)</span>
                                <span>+${quote.prePullFee.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.hazmatFee > 0 && (
                            <div className="flex justify-between text-xs text-red-600 font-bold">
                                <span>危险品附加费 (HAZ)</span>
                                <span>+${quote.hazmatFee.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.remoteSurcharge > 0 && (
                            <div className="flex justify-between text-xs text-red-600 font-medium">
                                <span>偏远地区派送费 (Remote)</span>
                                <span>+${quote.remoteSurcharge.toFixed(2)}</span>
                            </div>
                        )}
                        {quote.congestionSurcharge > 0 && (
                            <div className="flex justify-between text-xs text-red-600 font-medium">
                                <span>码头滞留费 (Detention)</span>
                                <span>+${quote.congestionSurcharge.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between text-sm text-slate-900 font-bold">
                            <span>总运费成本 (Total Cost)</span>
                            <span>${quote.totalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 rounded-xl shadow-xl transform transition-transform hover:scale-[1.02]">
                        <p className="text-indigo-200 text-[10px] font-bold mb-1 uppercase tracking-widest">建议对外报价 (Revenue)</p>
                        <div className="flex items-end gap-1">
                            <span className="text-sm font-bold pb-1 opacity-70">$</span>
                            <span className="text-4xl font-extrabold leading-none">{quote.recommendedPrice.toFixed(0)}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-indigo-200">
                            <span>已包含 30% 利润加成</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                                API: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'LIVE' : 'EST'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
