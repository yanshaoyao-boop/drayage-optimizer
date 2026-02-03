import Link from "next/link";
import { QuoteCalculator } from "@/components/QuoteCalculator";
import { CongestionMonitor } from "@/components/CongestionMonitor";
import { DispatchBoard } from "@/components/DispatchBoard";
import { Truck, LayoutDashboard, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Truck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Drayage<span className="text-indigo-600">OS</span> 智能调度系统
            </h1>
          </div>

          <nav className="flex gap-6">
            <Link href="#" className="flex items-center gap-2 text-indigo-600 font-medium">
              <LayoutDashboard size={18} /> 仪表盘 (Dashboard)
            </Link>
            <Link href="#" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
              <Settings size={18} /> 设置 (Settings)
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">OP</span>
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-900 leading-none">调度员 01</p>
              <p className="text-xs text-slate-500">Logistics Corp.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">运营指挥中心 (Operations Center)</h2>
          <p className="text-slate-500">美西/美东港口-亚马逊 FBA 线路实时调度优化</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Calculator */}
          <div className="lg:col-span-5">
            <QuoteCalculator />
          </div>

          {/* Right Column: Congestion Monitor */}
          <div className="lg:col-span-7 space-y-6">
            <CongestionMonitor />

            {/* Promo / Tip Block */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                <Truck size={140} />
              </div>
              <h3 className="font-bold text-lg mb-2 relative z-10">为什么需要智能调度？</h3>
              <p className="text-blue-100 text-sm max-w-lg relative z-10">
                避开像 ONT8 这样的严重拥堵仓库，每次往返可为您节省 <span className="font-bold text-white">$450+</span> 的司机滞留成本 (Detention Cost)。请密切关注热力图预警。
              </p>
              <button className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm border border-white/30">
                查看完整分析报表
              </button>
            </div>
          </div>

        </div>

        {/* Dispatch Control Tower Section */}
        <div className="mt-8">
          <DispatchBoard />
        </div>
      </main>
    </div>
  );
}
