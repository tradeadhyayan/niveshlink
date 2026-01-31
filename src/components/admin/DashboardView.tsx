import { useState, useEffect } from 'react';
import {
    Users, TrendingUp, CheckCircle2, IndianRupee, Target, Video
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatCard } from './AdminShared';

export const DashboardView = ({ setActiveTab }: { setActiveTab: (tab: any) => void }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await api.webinar.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Stats fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const conversion = stats.total > 0 ? Math.round((stats.enrolled / stats.total) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <StatCard
                    label="Total Leads"
                    val={stats.total}
                    icon={<Users className="text-blue-600" />}
                    onClick={() => setActiveTab('crm')}
                    color="bg-white hover:bg-white"
                />
                <StatCard
                    label="Hot Leads"
                    val={stats.hot}
                    icon={<TrendingUp className="text-orange-600" />}
                    onClick={() => setActiveTab('crm')}
                    color="bg-white hover:bg-white"
                />
                <StatCard
                    label="Enrolled"
                    val={stats.enrolled}
                    icon={<CheckCircle2 className="text-emerald-600" />}
                    onClick={() => setActiveTab('enrolled')}
                    color="bg-white hover:bg-white"
                />
                <StatCard
                    label="Total Fees"
                    val={`₹${stats.revenue.toLocaleString()}`}
                    icon={<IndianRupee className="text-purple-600" />}
                    onClick={() => setActiveTab('fees')}
                    color="bg-white hover:bg-white"
                />
                <StatCard
                    label="Conversion"
                    val={`${conversion}%`}
                    icon={<Target className="text-indigo-600" />}
                    onClick={() => setActiveTab('crm')}
                    color="bg-white hover:bg-white"
                />
                <StatCard
                    label="Growth Track"
                    val="..."
                    icon={<Video className="text-rose-600" />}
                    onClick={() => setActiveTab('webinars')}
                    color="bg-white hover:bg-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold font-heading text-slate-400 uppercase tracking-widest mb-8">Campaign Performance (Enrolled)</h3>
                    <div className="space-y-6">
                        {Object.entries(stats.campaigns || {}).length > 0 ? Object.entries(stats.campaigns).map(([name, count]: any) => (
                            <div key={name} className="flex items-center justify-between group">
                                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{name}</span>
                                <div className="flex items-center gap-4 flex-1 mx-4">
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(count / stats.enrolled) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{count}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No campaign data available</p>
                        )}
                    </div>
                </div>

                <div className="bg-emerald-600 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-emerald-200 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white mb-6 border border-white/20 shadow-2xl relative z-10">
                        <TrendingUp size={32} />
                    </div>
                    <h2 className="text-3xl font-bold font-heading mb-2 relative z-10">Growth Velocity</h2>
                    <p className="text-emerald-50/80 text-sm font-medium mb-8 max-w-[280px] relative z-10">Your enrollment conversion is at <span className="text-white font-bold">{conversion}%</span>. You're outperforming the platform average!</p>
                    <button onClick={() => setActiveTab('crm')} className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg relative z-10 active:scale-95">Analyze Leads</button>
                </div>
            </div>
        </div>
    );
};
