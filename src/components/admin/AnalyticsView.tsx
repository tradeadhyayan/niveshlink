import { useState, useEffect } from 'react';
import {
    BarChart3, Target, TrendingUp, Users, PieChart,
    Zap, Gem, ArrowUpRight, Activity, RefreshCcw
} from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function AnalyticsView() {
    const [data, setData] = useState<{ registrations: any[], expenses: any[] }>({ registrations: [], expenses: [] });
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const result = await api.admin.getAnalyticsData();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="py-40 text-center">
            <RefreshCcw className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-6" />
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Processing Intelligence...</p>
        </div>
    );

    // Calculations
    const totalLeads = data.registrations.length;
    const hotLeads = data.registrations.filter(r => r.lead_status === 'hot').length;
    const enrolledLeads = data.registrations.filter(r => r.lead_status === 'enrolled').length;

    const conversionRate = totalLeads > 0 ? ((enrolledLeads / totalLeads) * 100).toFixed(1) : '0';

    const totalRevenue = data.registrations.reduce((acc, curr) => acc + (Number(curr.fees_paid) || 0), 0);
    const totalExpenses = data.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const roi = totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(0) : '0';

    // Source Performance
    const sourceMap: any = {};
    data.registrations.forEach(r => {
        const s = r.campaign_source || 'Organic';
        if (!sourceMap[s]) sourceMap[s] = { total: 0, enrolled: 0, revenue: 0 };
        sourceMap[s].total++;
        if (r.lead_status === 'enrolled') {
            sourceMap[s].enrolled++;
            sourceMap[s].revenue += (Number(r.fees_paid) || 0);
        }
    });

    const totalFeesExpected = data.registrations.reduce((acc, curr) => acc + (Number(curr.fees_paid) || 0) + (Number(curr.fees_pending) || 0), 0);
    const totalPotentialBalance = totalFeesExpected - totalRevenue;

    const sources = Object.entries(sourceMap).map(([name, stats]: any) => ({
        name,
        ...stats,
        rate: stats.total > 0 ? ((stats.enrolled / stats.total) * 100).toFixed(1) : '0'
    })).sort((a: any, b: any) => b.revenue - a.revenue);

    return (
        <div className="space-y-12 pb-20">
            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    label="Total Students"
                    val={enrolledLeads.toLocaleString()}
                    sub="Total Enrolled"
                    icon={<Target className="text-emerald-500" />}
                    trend={`${conversionRate}% Enrollment Rate`}
                    color="emerald"
                />
                <MetricCard
                    label="Total Collections"
                    val={`₹${totalRevenue.toLocaleString()}`}
                    sub="Cash Inflow"
                    icon={<TrendingUp className="text-indigo-500" />}
                    trend={`₹${totalPotentialBalance.toLocaleString()} PENDING`}
                    color="indigo"
                />
                <MetricCard
                    label="Active Database"
                    val={totalLeads.toLocaleString()}
                    sub="Total Leads"
                    icon={<Users className="text-blue-500" />}
                    trend="Market Reach"
                    color="blue"
                />
                <MetricCard
                    label="Total Expenses"
                    val={`₹${totalExpenses.toLocaleString()}`}
                    sub="Operating Costs"
                    icon={<Activity className="text-amber-500" />}
                    trend={`₹${netProfit.toLocaleString()} NET NET`}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Source Intelligence */}
                <div className="xl:col-span-8 bg-white rounded-[3.5rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                        <BarChart3 size={250} />
                    </div>

                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900">Leads by Source</h3>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-2">Marketing Channel Performance</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"><Zap size={24} className="text-indigo-500" /></div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        {sources.map(s => (
                            <div key={s.name} className="group flex flex-col gap-5 p-8 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-[2.5rem] transition-all shadow-hover">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all"><PieChart size={20} /></div>
                                        <div>
                                            <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{s.name}</span>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-1">{s.total} Total Leads • {s.enrolled} Conversion</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{s.revenue.toLocaleString()}</span>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mt-1">{s.rate}% Batch Rate</p>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-200"
                                        style={{ width: `${Math.min(100, (s.revenue / (totalRevenue || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Funnel Logic */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                    <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent)] pointer-events-none" />

                        <div className="flex items-center gap-4 mb-12 relative z-10">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10"><Gem size={24} className="text-emerald-400" /></div>
                            <h4 className="text-2xl font-black uppercase tracking-tight">Student Funnel</h4>
                        </div>

                        <div className="space-y-16 relative z-10">
                            <FunnelStep label="Gross Market Database" val={totalLeads} color="bg-white/20" width="100%" />
                            <FunnelStep label="High Intent Interest" val={hotLeads} color="bg-amber-400" width={`${(hotLeads / (totalLeads || 1)) * 100}%`} />
                            <FunnelStep label="Paid Enrollments" val={enrolledLeads} color="bg-emerald-400" width={`${(enrolledLeads / (totalLeads || 1)) * 100}%`} />
                        </div>

                        <div className="mt-16 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Pipeline Velocity</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-4xl font-black block leading-none">{conversionRate}%</span>
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider mt-2 block">Database to Paid Rate</span>
                                </div>
                                <ArrowUpRight className="text-emerald-400" size={48} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-600 rounded-[3.5rem] p-12 text-white shadow-xl relative overflow-hidden h-[350px] flex flex-col justify-end group">
                        <div className="absolute -top-10 -right-10 p-12 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
                        <Activity className="absolute top-12 right-12 opacity-20" size={100} />

                        <p className="text-xs font-black text-white/70 uppercase tracking-[0.4em] mb-4">Growth Intelligence</p>
                        <h4 className="text-3xl lg:text-4xl font-black tracking-tighter leading-tight uppercase">Scaling Institute at {(Number(roi) / 10).toFixed(1)}x Capacity</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, val, sub, icon, trend, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <div className={cn("p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl transition-all hover:scale-[1.03] flex flex-col h-full relative group overflow-hidden")}>
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={cn("p-4 rounded-2xl shadow-lg border", colors[color])}>{icon}</div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{trend}</span>
            </div>
            <div className="mt-auto relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight text-slate-900">{val}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 ml-1">{sub}</p>
            </div>
            <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-10 rounded-full", colors[color].split(' ')[0])} />
        </div>
    );
}

function FunnelStep({ label, val, color, width }: any) {
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span>
                <span className="text-xl font-black">{val}</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-lg", color)} style={{ width }} />
            </div>
        </div>
    );
}
