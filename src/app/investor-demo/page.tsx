"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, TrendingUp, Zap, Gift, ArrowUpRight, DollarSign } from "lucide-react";

// --- MOCK DATA (HARDCODED) ---
const DEMO_DATA = {
  financial: {
    totalSavings: 14250.00,
    currency: "BRL",
    roiPercent: 32,
    paybackDate: "Nov/2026",
    lastMonthSavings: 450.50
  },
  systemHealth: {
    score: 98,
    maxScore: 100,
    status: "Operação Otimizada",
    lastCleaned: "15 dias atrás"
  },
  club: {
    balance: 450,
    level: "Gold",
    nextReward: "Voucher Outback (Faltam 50 coins)"
  },
  chartData: [
    { month: 'Jan', investment: 20000, return: 1200 },
    { month: 'Fev', investment: 19800, return: 2500 },
    { month: 'Mar', investment: 19600, return: 3900 },
    { month: 'Abr', investment: 19400, return: 5400 },
    { month: 'Mai', investment: 19200, return: 7100 },
    { month: 'Jun', investment: 19000, return: 9200 }, // Curva exponencial suave
  ]
};

export default function InvestorDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans selection:bg-yellow-500/30">
        
      {/* HEADER / HERO SECTION */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                        Investor Demo Mode
                    </Badge>
                    <span className="text-slate-400 text-sm">v2.0 Vision Alpha</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                    Olá, Mateus
                </h1>
                <p className="text-slate-400">Bem-vindo à sua Gestão de Riqueza Energética.</p>
            </div>
            
            <div className="flex items-center gap-3">
                 <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Relatório CFO
                 </Button>
                 <Button className="bg-yellow-500 text-slate-950 hover:bg-yellow-400 font-bold shadow-lg shadow-yellow-500/20">
                    <Gift className="w-4 h-4 mr-2" />
                    Solo Club
                 </Button>
            </div>
        </header>


        {/* WEALTH HEADER & ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MAIN WEALTH CARD */}
            <Card className="lg:col-span-2 border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-1000"></div>
                
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-sm font-medium tracking-wide uppercase">Lucro Líquido Acumulado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div>
                             <div className="flex items-baseline gap-2">
                                <span className="text-sm text-slate-500 font-bold">R$</span>
                                <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                                    {DEMO_DATA.financial.totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 mt-2 text-green-400 text-sm font-medium">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>+ R$ {DEMO_DATA.financial.lastMonthSavings.toFixed(2)} este mês</span>
                             </div>
                        </div>

                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-300 font-medium">Retorno do Investimento (ROI)</p>
                                    <p className="text-xs text-slate-500 mt-1">Seu sistema já se pagou em <span className="text-yellow-400 font-bold">{DEMO_DATA.financial.roiPercent}%</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Payback Estimado</p>
                                    <p className="text-sm font-bold text-slate-200">{DEMO_DATA.financial.paybackDate}</p>
                                </div>
                            </div>
                            <Progress value={DEMO_DATA.financial.roiPercent} className="h-2 bg-slate-800" indicatorClassName="bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SIDE WIDGETS COLUMN */}
            <div className="space-y-6">
                
                {/* SOLAR HEALTH (THE GUARDIAN) */}
                <Card className="border-slate-800 bg-slate-900 overflow-hidden relative border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Solar Health Score</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-white">{DEMO_DATA.systemHealth.score}</span>
                            <span className="text-sm text-slate-500 mb-1">/100</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            {DEMO_DATA.systemHealth.status}
                        </p>
                         <div className="mt-4 flex items-center gap-2 text-xs text-green-400/80 bg-green-500/10 p-2 rounded border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Painéis 100% operacionais
                        </div>
                    </CardContent>
                </Card>

                 {/* SOLO CLUB (THE ECOSYSTEM) */}
                 <Card className="border-slate-800 bg-slate-900 relative overflow-hidden group">
                     {/* Decorative background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-colors"></div>
                    
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-400" />
                            Solo Club
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-bold border-0 text-[10px]">
                            {DEMO_DATA.club.level}
                        </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-white mb-1">
                            {DEMO_DATA.club.balance} <span className="text-sm text-slate-500 font-normal">SoloCoins</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 truncate">
                            Próximo: {DEMO_DATA.club.nextReward}
                        </p>
                        <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                            Trocar Pontos
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>

        {/* FINANCIAL GROWTH CHART */}
        <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    Crescimento Patrimonial
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DEMO_DATA.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis 
                                dataKey="month" 
                                className="text-xs font-medium" 
                                tick={{ fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                className="text-xs font-medium" 
                                tick={{ fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#facc15' }}
                                labelStyle={{ color: '#94a3b8' }}
                                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, "Retorno Acumulado"]}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="return" 
                                stroke="#FACC15" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorReturn)" 
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#FACC15' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
