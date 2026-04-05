import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Video, ClipboardList, 
    HandCoins, ShieldCheck, LogOut, CheckCircle2, 
    RefreshCcw, Search, Filter, Download, Plus
} from 'lucide-react';
import { api, supabase } from '../lib/api';

export default function AdminDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchLeads();
            setLoading(false);
        });
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !session) return <div className="min-h-screen flex items-center justify-center bg-black"><RefreshCcw className="animate-spin text-emerald-500" /></div>;

    if (!session) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="bg-zinc-900 border border-white/10 p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
                    <h2 className="text-3xl font-bold font-heading mb-4">Admin Hub</h2>
                    <p className="text-white/40 mb-8 font-medium">Please login with authorized credentials.</p>
                    <button 
                         onClick={() => alert("Please use the original login flow or Supabase dashboard.")}
                         className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all font-heading"
                    >
                        Unlock System
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-8 flex flex-col hidden lg:flex">
                <div className="flex items-center gap-3 mb-16">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <ShieldCheck size={24} className="text-black" />
                    </div>
                    <span className="text-2xl font-bold font-heading tracking-tight">Nivesh Link</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active />
                    <NavItem icon={<Users size={20}/>} label="Registrations" />
                    <NavItem icon={<Video size={20}/>} label="Webinars" />
                    <NavItem icon={<HandCoins size={20}/>} label="Payments" />
                </nav>

                <button 
                    onClick={() => supabase.auth.signOut()}
                    className="flex items-center gap-4 px-6 py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all mt-auto"
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold font-heading">Lead Registry</h2>
                    <div className="flex gap-4">
                        <button className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-white/10 transition-all">
                            <Download size={18} /> Export CSV
                        </button>
                        <button className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-emerald-400 transition-all">
                            <Plus size={18} /> Add Lead
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Total Leads" value={leads.length} color="text-emerald-500" />
                    <StatCard label="Paid Members" value={leads.filter(l => l.lead_status === 'enrolled').length} color="text-emerald-500" />
                    <StatCard label="Conversions" value={`${Math.round((leads.filter(l => l.lead_status === 'enrolled').length / (leads.length || 1)) * 100)}%`} color="text-emerald-500" />
                    <StatCard label="Revenue" value={`₹${leads.filter(l => l.lead_status === 'enrolled').length * 499}`} color="text-emerald-500" />
                </div>

                {/* Table */}
                <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all" placeholder="Search by name or number..." />
                        </div>
                        <div className="flex gap-4">
                             <button className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm text-white/60">
                                <Filter size={18} /> Filter
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-white/40">
                            <tr>
                                <th className="px-8 py-6">Lead Details</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leads.slice(0, 10).map((lead, i) => (
                                <tr key={i} className="hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-6">
                                        <p className="font-bold mb-1">{lead.name}</p>
                                        <p className="text-xs text-white/40">{lead.whatsapp} • {lead.email}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-white/40">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${lead.lead_status === 'enrolled' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                            {lead.lead_status || 'INTERESTED'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-all">
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            {icon}
            {label}
        </button>
    );
}

function StatCard({ label, value, color }: any) {
    return (
        <div className="bg-black/40 border border-white/5 p-8 rounded-[2rem] shadow-xl">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-heading">{label}</p>
            <p className={`text-4xl font-bold font-heading ${color}`}>{value}</p>
        </div>
    );
}
