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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const ADMIN_WHITELIST = ['niveshlink.edu@gmail.com', 'niveshlink.official@gmail.com'];
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                const authorized = ADMIN_WHITELIST.includes(session.user?.email || '');
                setIsAuthorized(authorized);
                if (authorized) fetchLeads();
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                const authorized = ADMIN_WHITELIST.includes(session.user?.email || '');
                setIsAuthorized(authorized);
                if (authorized) fetchLeads();
            } else {
                setIsAuthorized(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            
            if (data.user && !ADMIN_WHITELIST.includes(data.user.email || '')) {
                throw new Error("This account is not authorized to access the Admin Portal.");
            }
        } catch (err: any) {
            setLoginError(err.message || 'Login failed');
            // Sign out if unauthorized to prevent session hanging
            if (err.message?.includes("authorized")) {
                await supabase.auth.signOut();
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

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

    if (loading && !session) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6">
            <RefreshCcw className="animate-spin text-emerald-500" size={32} />
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Establishing Secure Connection</p>
        </div>
    );

    if (session && isAuthorized === false) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="bg-zinc-900 border border-rose-500/20 p-12 rounded-[3.5rem] w-full max-w-md text-center shadow-2xl space-y-8">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-heading">Access Denied</h2>
                        <p className="text-white/40 text-sm font-medium">Your account ({session.user?.email}) is not on the authorized whitelist.</p>
                    </div>
                    <button 
                         onClick={() => supabase.auth.signOut()}
                         className="w-full bg-white/5 border border-white/10 text-white/60 py-4 rounded-xl font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                    >
                        Switch Account
                    </button>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
                <div className="fixed inset-0 bg-emerald-glow opacity-20 pointer-events-none" />
                
                <div className="bg-zinc-900 border border-white/10 p-10 md:p-14 rounded-[3rem] w-full max-w-md text-center shadow-2xl relative z-10 glass-card">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={32} className="text-black" />
                    </div>
                    <h2 className="text-4xl font-bold font-heading mb-3 tracking-tight">Admin Portal</h2>
                    <p className="text-white/40 mb-10 font-medium">Restricted access for Nivesh Link staff only.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-emerald-500 outline-none transition-all"
                                placeholder="name@niveshlink.com"
                                required
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Password</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-emerald-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        {loginError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                <p className="text-rose-500 text-xs font-bold">{loginError}</p>
                            </div>
                        )}

                        <button 
                             type="submit"
                             disabled={isLoggingIn}
                             className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all font-heading shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {isLoggingIn ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : 'Unlock Systems'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const totalRevenue = leads
        .filter(l => l.lead_status === 'enrolled')
        .reduce((sum, l) => {
            // Heuristic if amount field is missing: check order_id prefix or product field
            const amt = l.amount || (l.product_name?.includes('Elite') ? 20000 : (l.product_name?.includes('Smart') ? 6000 : 49));
            return sum + (Number(amt) || 0);
        }, 0);

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
                    <div>
                        <h2 className="text-3xl font-bold font-heading">Lead Registry</h2>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Intelligence Hub v4.2</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchLeads}
                            className="bg-white/5 border border-white/10 p-2.5 rounded-xl hover:bg-white/10 transition-all text-emerald-500"
                        >
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-white/10 transition-all font-bold">
                            <Download size={18} /> Export CSV
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Total Leads" value={leads.length} color="text-emerald-500" />
                    <StatCard label="Paid Members" value={leads.filter(l => l.lead_status === 'enrolled').length} color="text-emerald-400" />
                    <StatCard label="Conversions" value={`${Math.round((leads.filter(l => l.lead_status === 'enrolled').length / (leads.length || 1)) * 100)}%`} color="text-blue-400" />
                    <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="text-amber-500" />
                </div>

                {/* Table */}
                <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6 bg-white/[0.01]">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10" placeholder="Search by name, email or number..." />
                        </div>
                        <div className="flex gap-4">
                             <button className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm text-white/60 hover:bg-white/10 transition-colors">
                                <Filter size={18} /> Filter Status
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/20">
                                <tr>
                                    <th className="px-8 py-6">Lead Protocol</th>
                                    <th className="px-8 py-6">Timestamp</th>
                                    <th className="px-8 py-6">Product Type</th>
                                    <th className="px-8 py-6">Access Status</th>
                                    <th className="px-8 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.map((lead, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">{lead.name}</p>
                                            <p className="text-[10px] text-white/20 font-mono">{lead.whatsapp} • {lead.email}</p>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-white/40 font-medium">
                                            {new Date(lead.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-white/60">
                                            {lead.product_name || (lead.amount === 49 ? 'Webinar' : 'Course')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-lg border ${
                                                lead.lead_status === 'enrolled' 
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                : 'bg-white/5 text-white/20 border-white/10'
                                            }`}>
                                                {lead.lead_status || 'INTERESTED'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 bg-white/5 border border-white/10 text-white/20 hover:text-emerald-500 hover:border-emerald-500/30 rounded-xl transition-all active:scale-90">
                                                <ClipboardList size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
