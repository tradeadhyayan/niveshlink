import { useState, useEffect } from 'react';
import {
    Search, ArrowLeft, RefreshCcw,
    Users, CheckCircle2, Calendar,
    LayoutDashboard, ClipboardList,
    Plus, Trash2,
    CheckCircle, TrendingUp, HandCoins,
    IndianRupee, History, Receipt,
    Sheet, Link, AlertTriangle, Lock, Download,
    Mail, ShieldCheck, ClipboardPaste, X, Video, Zap, MoreVertical, LogOut,
} from 'lucide-react';
import { api, supabase } from '../lib/api';
import { cn } from '../lib/utils';

type Tab = 'dashboard' | 'crm' | 'webinars' | 'tasks' | 'fees' | 'courses' | 'batches' | 'users' | 'enrolled';

export default function AdminDashboard() {
    const [session, setSession] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: 'Admin User',
                    }
                }
            });
            if (error) alert(error.message);
            else alert('Account created! Please check your email for the confirmation link.');
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) alert(error.message);
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCcw className="animate-spin text-emerald-600" /></div>;

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold font-heading mb-2">Admin Access</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        {isSignUp ? "Create a new admin account." : "Enter your credentials to access the dashboard."}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                type="email"
                                placeholder="name@niveshlink.co"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                required
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-colors"
                        >
                            {authLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Unlock Dashboard')}
                        </button>
                    </form>

                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
                        >
                            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                        </button>
                        <button
                            onClick={() => window.location.hash = ''}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                            Back to Landing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <AdminDashboardContent session={session} onLogout={handleLogout} />;
}

function AdminDashboardContent({ session, onLogout }: any) {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [webinars, setWebinars] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [regs, tks, crs, bts, webs, usrs] = await Promise.all([
                api.webinar.getAllRegistrations(),
                api.tasks.getAll(),
                api.courses.getAll(),
                api.batches.getAll(),
                api.webinar.getAll(),
                api.users.list()
            ]);
            setRegistrations(regs || []);
            setTasks(tks || []);
            setCourses(crs || []);
            setBatches(bts || []);
            setWebinars(webs || []);
            setUsers(usrs || []);
        } catch (err: any) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView registrations={registrations} setActiveTab={setActiveTab} />;
            case 'crm': return <CRMView registrations={registrations} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onUpdate={fetchData} courses={courses} webinars={webinars} />;
            case 'webinars': return <WebinarsView webinars={webinars} onUpdate={fetchData} />;
            case 'tasks': return <TasksView tasks={tasks} onUpdate={fetchData} />;
            case 'fees': return <FeesView registrations={registrations} onUpdate={fetchData} />;
            case 'courses': return <CoursesView courses={courses} onUpdate={fetchData} />;
            case 'batches': return <BatchesView batches={batches} courses={courses} onUpdate={fetchData} />;
            case 'users': return <UsersView users={users} courses={courses} onUpdate={fetchData} />;
            case 'enrolled': return <EnrolledView users={users} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-body text-slate-900 overflow-x-hidden">
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.hash = '#/'} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-600 hidden md:block" />
                            <div>
                                <h1 className="text-base md:text-xl font-bold font-heading text-emerald-600">Admin Dashboard</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session?.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2">
                        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={16} />} label="Stats" />
                        <TabButton active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} icon={<Users size={16} />} label="Leads" />
                        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<ShieldCheck size={16} />} label="Users" />
                        <TabButton active={activeTab === 'enrolled'} onClick={() => setActiveTab('enrolled')} icon={<CheckCircle2 size={16} />} label="Enrolled" />
                        <TabButton active={activeTab === 'webinars'} onClick={() => setActiveTab('webinars')} icon={<Video size={16} />} label="Webinars" />
                        <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ClipboardList size={16} />} label="Tasks" />
                        <TabButton active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} icon={<HandCoins size={16} />} label="Fees" />
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold transition-all shrink-0 min-w-[4rem] md:min-w-auto ${active
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
        >
            {icon}
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
}

function WebinarsView({ webinars, onUpdate }: any) {
    const [showForm, setShowForm] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">Webinar Management</h2>
                <button
                    onClick={() => { setEditingWebinar(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                    <Plus size={16} /> New Webinar
                </button>
            </div>

            <div className="grid grid-cols-1 md:hidden gap-4">
                {webinars.map((web: any) => (
                    <div key={web.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest ${web.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                            {web.status}
                        </div>
                        <div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">{web.event_type}</span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">{web.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(web.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1"><History size={14} /> {web.time}</div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                            <button onClick={() => { setEditingWebinar(web); setShowForm(true); }} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">Edit</button>
                            <button onClick={() => { if (confirm('Delete?')) api.webinar.delete(web.id).then(onUpdate); }} className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic / Title</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {webinars.map((web: any) => (
                            <tr key={web.id} className="hover:bg-slate-50/50 group transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-900">{web.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-600">{new Date(web.date).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{web.time}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">{web.event_type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${web.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {web.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingWebinar(web); setShowForm(true); }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete webinar?')) api.webinar.delete(web.id).then(onUpdate); }}
                                            className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <WebinarForm
                    webinar={editingWebinar}
                    onClose={() => setShowForm(false)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}

function DashboardView({ registrations, setActiveTab }: any) {
    const stats = {
        total: registrations.length,
        hot: registrations.filter((r: any) => r.lead_status === 'hot').length,
        enrolled: registrations.filter((r: any) => r.lead_status === 'enrolled').length,
        revenue: registrations.reduce((acc: number, r: any) => acc + (Number(r.fees_paid) || 0), 0),
        conversion: registrations.length ? Math.round((registrations.filter((r: any) => r.lead_status === 'enrolled').length / registrations.length) * 100) : 0,
        demoSessions: registrations.filter((r: any) => r.webinars?.event_type === 'Demo Session').length,
        webinars: registrations.filter((r: any) => r.webinars?.event_type === 'Webinar' || !r.webinars?.event_type).length
    };

    const campaigns: any = {};
    registrations.forEach((r: any) => {
        const source = r.campaign_source || 'Organic';
        campaigns[source] = (campaigns[source] || 0) + 1;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                <StatCard
                    label="Total Leads"
                    val={stats.total}
                    icon={<Users className="text-blue-600" />}
                    onClick={() => setActiveTab('crm')}
                    color="bg-blue-50/50 hover:bg-blue-50"
                />
                <StatCard
                    label="Hot Leads"
                    val={stats.hot}
                    icon={<TrendingUp className="text-orange-600" />}
                    onClick={() => setActiveTab('crm')}
                    color="bg-orange-50/50 hover:bg-orange-50"
                />
                <StatCard
                    label="Enrolled"
                    val={stats.enrolled}
                    icon={<CheckCircle2 className="text-emerald-600" />}
                    onClick={() => setActiveTab('fees')}
                    color="bg-emerald-50/50 hover:bg-emerald-50"
                />
                <StatCard
                    label="Total Fees"
                    val={`₹${stats.revenue.toLocaleString()}`}
                    icon={<IndianRupee className="text-purple-600" />}
                    onClick={() => setActiveTab('fees')}
                    color="bg-purple-50/50 hover:bg-purple-50"
                />
                <StatCard
                    label="Webinars"
                    val={stats.webinars}
                    icon={<Video className="text-indigo-600" />}
                    onClick={() => setActiveTab('webinars')}
                    color="bg-indigo-50/50 hover:bg-indigo-50"
                />
                <StatCard
                    label="Demos"
                    val={stats.demoSessions}
                    icon={<Calendar className="text-pink-600" />}
                    onClick={() => setActiveTab('webinars')}
                    color="bg-pink-50/50 hover:bg-pink-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold font-heading text-slate-400 uppercase tracking-widest mb-8">Campaign Performance</h3>
                    <div className="space-y-6">
                        {Object.entries(campaigns).map(([name, count]: any) => (
                            <div key={name} className="flex items-center justify-between group">
                                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{name}</span>
                                <div className="flex items-center gap-4 flex-1 mx-4">
                                    <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(count / stats.total) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-emerald-400 mb-6 border border-white/10">
                        <Calendar size={40} />
                    </div>
                    <h3 className="font-bold font-heading text-2xl mb-2">Webinar Planner</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">Schedule your next masterclass or demo session to boost enrollments.</p>
                    <button onClick={() => setActiveTab('webinars')} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/50">
                        Manage Events
                    </button>
                </div>
            </div>
        </div>
    );
}

function CRMView({ registrations, searchTerm, setSearchTerm, onUpdate, courses, webinars }: any) {
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [showSync, setShowSync] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
    const [filterSource, setFilterSource] = useState('All');
    const [filterExperience, setFilterExperience] = useState('All');
    const [filterWebinar, setFilterWebinar] = useState('All');
    const [crmTab, setCrmTab] = useState<'webinar' | 'demo' | 'seminar' | 'all'>('webinar');

    // Filter logic
    const filtered = registrations.filter((r: any) => {
        const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.whatsapp?.includes(searchTerm);
        const matchesSource = filterSource === 'All' || r.campaign_source === filterSource;
        const matchesExperience = filterExperience === 'All' || r.experience_level === filterExperience;
        const matchesWebinar = filterWebinar === 'All' || r.webinar_id === filterWebinar;

        // CRM Categorization Logic
        let matchesCrmTab = true;
        if (crmTab === 'webinar') {
            matchesCrmTab = r.webinars?.event_type === 'Webinar';
        } else if (crmTab === 'demo') {
            matchesCrmTab = r.webinars?.event_type === 'Demo Session';
        } else if (crmTab === 'seminar') {
            matchesCrmTab = r.webinars?.event_type === 'Seminar' || r.campaign_source === 'Seminar';
        }
        // 'all' shows everything

        return matchesSearch && matchesSource && matchesExperience && matchesWebinar && matchesCrmTab;
    });

    const exportToCSV = () => {
        const headers = ["Name", "Phone", "Email", "City", "Experience", "Source", "Status", "Webinar", "Assignee"];
        const rows = filtered.map((r: any) => [
            `"${r.name || ''}"`,
            `"${r.whatsapp || ''}"`,
            `"${r.email || ''}"`,
            `"${r.city || ''}"`,
            `"${r.experience_level || ''}"`,
            `"${r.campaign_source || 'Organic'}"`,
            `"${r.lead_status || ''}"`,
            `"${r.webinars?.title || ''}"`,
            `"${r.assigned_to || ''}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `nivesh_leads_${crmTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex p-1 bg-white rounded-2xl border border-slate-200 w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button onClick={() => setCrmTab('webinar')} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'webinar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Webinar Joinees</button>
                    <button onClick={() => setCrmTab('demo')} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'demo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Demo Attendees</button>
                    <button onClick={() => setCrmTab('seminar')} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'seminar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Seminars</button>
                    <button onClick={() => setCrmTab('all')} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Leads Database</button>
                </div>

                <div className="flex gap-2 w-full xl:w-auto">
                    <button onClick={exportToCSV} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500/30 transition-all text-sm font-semibold"
                    />
                </div>
                <div className="flex gap-2 text-white">
                    <button
                        onClick={() => setShowSync(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                    >
                        <Sheet size={16} /> Sync
                    </button>
                    <button
                        onClick={() => setShowPaste(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                    >
                        <ClipboardPaste size={16} /> Paste
                    </button>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none text-slate-600"
                >
                    <option value="All">All Sources</option>
                    <option value="Justdial">Justdial</option>
                    <option value="Data Vendor">Data Vendor</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-ins">Walk-ins</option>
                    <option value="Website">Website</option>
                </select>
                <select
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none text-slate-600"
                >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                <select
                    value={filterWebinar}
                    onChange={(e) => setFilterWebinar(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none min-w-[150px] text-slate-600"
                >
                    <option value="All">All Events</option>
                    {webinars.map((w: any) => (
                        <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:hidden gap-4">
                {filtered.length > 0 ? filtered.map((reg: any) => (
                    <div key={reg.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-900">{reg.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                                    <ShieldCheck size={10} /> {reg.city || 'No Location'}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setSelectedLead(reg)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Sheet size={16} /></button>
                                <button onClick={async () => { if (confirm('Delete lead?')) { await api.webinar.deleteRegistration(reg.id); onUpdate(); } }} className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact</span>
                                <span className="font-bold text-slate-600">{reg.whatsapp}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                <StatusBadge status={reg.lead_status} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-xl">
                            <span>{reg.campaign_source || 'Organic'}</span>
                            <span className="uppercase">{reg.webinars?.event_type || 'N/A'}</span>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center bg-white rounded-[2rem] border border-slate-100">
                        <Users size={32} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-400">No leads found</p>
                    </div>
                )}
            </div>

            <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length > 0 ? filtered.map((reg: any) => (
                                <tr key={reg.id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{reg.name}</p>
                                        <p className="text-[10px] font-semibold text-slate-400">{reg.city || 'No Location'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-600">{reg.whatsapp}</p>
                                        <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[100px]">{reg.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${reg.campaign_source === 'Justdial' ? 'bg-orange-100 text-orange-600' :
                                            reg.campaign_source === 'Data Vendor' ? 'bg-purple-100 text-purple-600' :
                                                reg.campaign_source === 'Referral' ? 'bg-blue-100 text-blue-600' :
                                                    reg.campaign_source === 'Walk-ins' ? 'bg-indigo-100 text-indigo-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {reg.campaign_source || 'Organic'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-600">{reg.webinars?.title || 'N/A'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{reg.webinars?.event_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {reg.assigned_to ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                                                    {reg.assigned_to[0]}
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                                    <Users size={12} />
                                                </div>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-600">{reg.assigned_to || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={reg.lead_status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setSelectedLead(reg)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                                                <Sheet size={16} />
                                            </button>
                                            <button onClick={async () => { if (confirm('Delete lead?')) { await api.webinar.deleteRegistration(reg.id); onUpdate(); } }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                            <Users size={32} className="text-slate-300" />
                                            <p className="text-sm font-bold text-slate-400">No leads found matching criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedLead && (
                <EditLeadModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={onUpdate}
                    courses={courses}
                    webinars={webinars}
                />
            )}

            {showSync && <SyncModal onClose={() => setShowSync(false)} onUpdate={onUpdate} />}
            {showPaste && <PasteImportModal onClose={() => setShowPaste(false)} onUpdate={onUpdate} webinars={webinars} />}
        </div>
    );
}

function SyncModal({ onClose, onUpdate }: any) {
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.settings.get('googlesheets_link').then(val => {
            if (val?.url) setSheetUrl(val.url);
            else setSheetUrl('https://docs.google.com/spreadsheets/d/e/2PACX-1vT33Ba34FcYbOnHtbWxI_0aync2FMkVOz3hPM2PXPrVGZiuiRBcJLGRI_BE81DgUF8BLuXVFDfZbZk9/pub?output=csv');
        });
    }, []);

    const performSync = async () => {
        if (!sheetUrl.includes('/pub?')) {
            setError('Please use a "Published as CSV" link. (File > Share > Publish to Web)');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.settings.update('googlesheets_link', { url: sheetUrl });
            const response = await fetch(sheetUrl);
            const csvText = await response.text();

            const lines = csvText.split('\n');
            const leads = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (!cols[1] || !cols[2]) return null; // Skip if Name or Phone is missing
                return {
                    name: cols[1],
                    whatsapp: cols[2].toString(),
                    email: '', // Not in this sheet
                    experience: cols[3] || 'Direct', // Using source as experience/tag
                    lead_status: 'cold',
                    created_at: new Date().toISOString()
                };
            }).filter(Boolean);

            if (leads.length > 0) {
                await api.webinar.syncBulk(leads);
                onUpdate();
                onClose();
            } else {
                setError('No valid leads found in sheet.');
            }
        } catch (err) {
            setError('Failed to fetch sheet. Ensure it is published as CSV.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                    <Link size={24} />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">Google Sheets Sync</h3>
                <p className="text-sm text-slate-400 mb-6">Sync your existing leads from a Google Sheet instantly.</p>

                <div className="space-y-4 mb-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Published CSV Link</label>
                        <input
                            type="text"
                            placeholder="https://docs.google.com/spreadsheets/.../pub?output=csv"
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-xs font-bold outline-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-[10px] font-bold">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2">Instructions:</p>
                    <ol className="text-[10px] font-semibold text-slate-500 space-y-1 list-decimal ml-4">
                        <li>Open your Google Sheet.</li>
                        <li>File {'>'} Share {'>'} Publish to web.</li>
                        <li>Select "Entire Document" and "CSV".</li>
                        <li>Copy and paste that link here.</li>
                        <li>Columns must be: Name, Phone, Email, Experience.</li>
                    </ol>
                </div>

                <button
                    disabled={loading}
                    onClick={performSync}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg"
                >
                    {loading ? 'Syncing...' : 'Sync Now'}
                </button>
                <button onClick={onClose} className="w-full py-3 text-xs font-bold text-slate-400 mt-2">Maybe Later</button>
            </div>
        </div>
    );
}

function PasteImportModal({ onClose, onUpdate, webinars }: any) {
    const [pasteRaw, setPasteRaw] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [defaultSource, setDefaultSource] = useState('Data Vendor');
    const [defaultAssignee, setDefaultAssignee] = useState('Unassigned');
    const [targetWebinar, setTargetWebinar] = useState('');

    useEffect(() => {
        if (!pasteRaw.trim()) {
            setPreview([]);
            return;
        }

        const lines = pasteRaw.trim().split('\n');
        const parsed = lines.map(line => {
            if (!line.trim()) return null;
            // Support Tab (Excel) or Comma
            let parts = line.split(/[\t]/);
            if (parts.length < 2) parts = line.split(',');

            const cols = parts.map(p => p.trim()).filter(p => p !== '');

            // Robust parsing: Try to find Name and Phone
            // If 2 cols: Name, Phone
            // If 3 cols: Sr, Name, Phone OR Name, Phone, Source

            if (cols.length >= 2) {
                // Heuristic: If col[0] is number, it might be Sr No.
                const isFirstColNumber = !isNaN(Number(cols[0]));

                if (isFirstColNumber && cols.length >= 3) {
                    return {
                        name: cols[1],
                        whatsapp: cols[2].toString(),
                        experience: cols[3] || 'Direct'
                    };
                } else {
                    return {
                        name: cols[0],
                        whatsapp: cols[1].toString(),
                        experience: cols[2] || 'Direct'
                    };
                }
            }
            return null;
        }).filter(Boolean);

        setPreview(parsed);
    }, [pasteRaw]);

    const handleSync = async () => {
        if (!preview.length) return;
        setLoading(true);
        try {
            const leads = preview.map(p => ({
                ...p,
                lead_status: 'cold',
                campaign_source: defaultSource,
                assigned_to: defaultAssignee === 'Unassigned' ? null : defaultAssignee,
                webinar_id: targetWebinar || null,
                created_at: new Date().toISOString()
            }));
            await api.webinar.syncBulk(leads);
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to sync leads');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <ClipboardPaste size={20} />
                        </div>
                        <h3 className="text-xl font-bold font-heading">Direct Paste Leads</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Batch Settings</p>
                        </div>
                        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Default Source</label>
                                <select
                                    value={defaultSource}
                                    onChange={(e) => setDefaultSource(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                >
                                    <option value="Justdial">Justdial</option>
                                    <option value="Data Vendor">Data Vendor</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Walk-ins">Walk-ins</option>
                                    <option value="Organic">Organic</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Default Assignee</label>
                                <select
                                    value={defaultAssignee}
                                    onChange={(e) => setDefaultAssignee(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                >
                                    <option value="Unassigned">Unassigned</option>
                                    <option value="Ajay">Ajay</option>
                                    <option value="Gaurav">Gaurav</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Webinar</label>
                                <select
                                    value={targetWebinar}
                                    onChange={(e) => setTargetWebinar(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                                >
                                    <option value="">-- No Webinar --</option>
                                    {webinars?.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Paste Data</p>
                            <span className="text-[9px] font-bold text-emerald-600">Tab-separated supported</span>
                        </div>
                        <textarea
                            value={pasteRaw}
                            onChange={(e) => setPasteRaw(e.target.value)}
                            placeholder="Name, Phone..."
                            className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500/30 text-xs font-semibold resize-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Preview ({preview.length} leads found)</p>
                        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-3xl bg-slate-50/30">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter">Name</th>
                                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter">Phone</th>
                                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter">Default Source</th>
                                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter">Assignee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {preview.map((p, i) => (
                                        <tr key={i} className="bg-white">
                                            <td className="px-4 py-3 font-bold">{p.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{p.whatsapp}</td>
                                            <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold uppercase">{defaultSource}</span></td>
                                            <td className="px-4 py-3 text-slate-500 font-bold">{defaultAssignee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            disabled={loading || !preview.length}
                            onClick={handleSync}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Import ${preview.length} Leads`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TasksView({ tasks, onUpdate }: any) {
    const [title, setTitle] = useState('');
    const [assignee, setAssignee] = useState<'Ajay' | 'Gaurav'>('Ajay');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [dueDate, setDueDate] = useState('');

    const addTask = async (e: any) => {
        e.preventDefault();
        if (!title) return;
        await api.tasks.create({
            title,
            assigned_to: assignee,
            status: 'pending',
            priority,
            due_date: dueDate || null
        });
        setTitle('');
        setDueDate('');
        onUpdate();
    };

    const toggleTask = async (task: any) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await api.tasks.update(task.id, { status: newStatus });
        onUpdate();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold font-heading text-slate-400 uppercase tracking-widest mb-6">New Task</h3>
                    <form onSubmit={addTask} className="space-y-4">
                        <input
                            type="text" placeholder="What needs to be done?"
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => setAssignee('Ajay')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${assignee === 'Ajay' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Ajay</button>
                                    <button type="button" onClick={() => setAssignee('Gaurav')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${assignee === 'Gaurav' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Gaurav</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e: any) => setPriority(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-transparent rounded-xl text-[10px] font-bold outline-none"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none"
                            />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-100">Create Task</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {tasks.map((task: any) => (
                    <div key={task.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div className="flex items-start gap-4">
                            <button onClick={() => toggleTask(task)}
                                className={`w-6 h-6 mt-1 md:mt-0 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                                {task.status === 'completed' && <CheckCircle size={14} />}
                            </button>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <p className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                                    {task.priority === 'High' && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-bold uppercase rounded">Urgent</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">For {task.assigned_to}</span>
                                    {task.due_date && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={async () => { await api.tasks.delete(task.id); onUpdate(); }} className="p-2 self-end md:self-auto text-slate-300 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FeesView({ registrations, onUpdate }: any) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [newAmount, setNewAmount] = useState('');

    const enrolledStudents = registrations.filter((r: any) => r.lead_status === 'enrolled');

    const openInvoices = async (student: any) => {
        setSelectedStudent(student);
        const data = await api.fees.getInstallments(student.id);
        setInstallments(data || []);
    };

    const addPayment = async () => {
        if (!newAmount) return;
        await api.fees.addInstallment({
            registration_id: selectedStudent.id,
            amount: Number(newAmount),
            payment_date: new Date().toISOString()
        });
        setNewAmount('');
        openInvoices(selectedStudent);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {enrolledStudents.map((reg: any) => {
                            const coursePrice = reg.courses?.price || 0;
                            const balance = coursePrice - (reg.fees_paid || 0);
                            return (
                                <tr key={reg.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold">{reg.name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{reg.courses?.name || 'Not Assigned'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{reg.fees_paid?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-orange-500">₹{balance.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openInvoices(reg)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                            <History size={12} /> History
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold font-heading">{selectedStudent.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.courses?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Fees</p>
                                <p className="text-xl font-bold text-slate-900">₹{selectedStudent.courses?.price?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto space-y-3">
                            {installments.length > 0 ? installments.map((ins: any) => (
                                <div key={ins.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                            <Receipt size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Installment</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ins.payment_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600">₹{ins.amount.toLocaleString()}</p>
                                </div>
                            )) : (
                                <p className="text-center py-4 text-xs font-bold text-slate-300">No installments found</p>
                            )}
                        </div>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="number" placeholder="Enter amount..."
                                value={newAmount} onChange={e => setNewAmount(e.target.value)}
                                className="flex-1 px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
                            />
                            <button onClick={addPayment} className="px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest">Collect</button>
                        </div>

                        <button onClick={() => setSelectedStudent(null)} className="w-full py-2 text-sm font-bold text-slate-400">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function WebinarForm({ webinar, onClose, onUpdate }: any) {
    const [form, setForm] = useState(webinar || { title: '', date: '', time: '', link: '', whatsapp_group_link: '', event_type: 'Webinar', status: 'active' });
    const [loading, setLoading] = useState(false);

    const submit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (webinar?.id) {
                await api.webinar.update(webinar.id, form);
            } else {
                await api.webinar.create(form);
            }
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-heading">{webinar ? 'Edit Event' : 'New Webinar Plan'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={submit} className="space-y-5">
                    <FormInput label="Webinar Topic / Title" value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Event Date" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} />
                        <FormInput label="Event Time" placeholder="e.g. 7:00 PM" value={form.time} onChange={(v: string) => setForm({ ...form, time: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
                            <select
                                value={form.event_type}
                                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer"
                            >
                                <option value="Webinar">Webinar</option>
                                <option value="Demo Session">Demo Session</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Past / Closed</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <FormInput label="WhatsApp Group Link (Auto-Join)" value={form.whatsapp_group_link} onChange={(v: string) => setForm({ ...form, whatsapp_group_link: v })} />
                    <FormInput label="Meeting Link (Zoom/Meet)" value={form.link} onChange={(v: string) => setForm({ ...form, link: v })} />

                    <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest mt-6 shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all">
                        {loading ? 'Processing...' : (webinar ? 'Update Details' : 'Finalize & Launch Event')}
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">Cancel</button>
                </form>
            </div>
        </div>
    );
}

function FormInput({ label, type = "text", placeholder, value, onChange }: any) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input required type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none" />
        </div>
    );
}

function CoursesView({ courses, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', price: '', duration: '', description: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        await api.courses.create({ ...newCourse, price: Number(newCourse.price) });
        setNewCourse({ name: '', price: '', duration: '', description: '' });
        setShowAdd(false);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">Course Directory</h2>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all">
                    <Plus size={16} /> New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <Zap size={24} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">{course.status}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{course.name}</h3>
                            <p className="text-xs text-slate-400 font-semibold mb-4">{course.duration || 'Flexible duration'}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-6">{course.description || 'Professional coaching module for career growth.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <span className="text-xl font-bold text-slate-900">₹{course.price.toLocaleString()}</span>
                            <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xl font-bold font-heading mb-6">Launch New Course</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <FormInput label="Course Name" value={newCourse.name} onChange={(v: string) => setNewCourse({ ...newCourse, name: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Price (₹)" type="number" value={newCourse.price} onChange={(v: string) => setNewCourse({ ...newCourse, price: v })} />
                                <FormInput label="Duration (e.g. 8 Weeks)" value={newCourse.duration} onChange={(v: string) => setNewCourse({ ...newCourse, duration: v })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none h-24"
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest mt-4">Create Course</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="w-full py-2 text-xs font-bold text-slate-400">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function BatchesView({ batches, courses, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [newBatch, setNewBatch] = useState({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_id: '', status: 'upcoming' });
    const handleAdd = async (e: any) => {
        e.preventDefault();
        await api.batches.create(newBatch);
        setNewBatch({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_id: '', status: 'upcoming' });
        setShowAdd(false);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">Active Batches</h2>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    <Plus size={16} /> New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch: any) => (
                    <div key={batch.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{batch.name}</h3>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{batch.courses?.name}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter">Starts</span>
                                <span className="font-bold">{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBD'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter">Mentor</span>
                                <span className="font-bold">Ajay</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full mt-4 overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[65%]" />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                <span>Capacity</span>
                                <span>12 / {batch.max_students} Students</span>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">Manage Batch</button>
                    </div>
                ))}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xl font-bold font-heading mb-6">Plan New Cohort</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <FormInput label="Batch Name" value={newBatch.name} onChange={(v: string) => setNewBatch({ ...newBatch, name: v })} />
                            <div className="space-y-1.5 text-left">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Parent Course</label>
                                <select
                                    value={newBatch.course_id}
                                    onChange={(e) => setNewBatch({ ...newBatch, course_id: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none cursor-pointer"
                                >
                                    {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Start Date" type="date" value={newBatch.start_date} onChange={(v: string) => setNewBatch({ ...newBatch, start_date: v })} />
                                <FormInput label="Mentor Name" value={newBatch.mentor_id} onChange={(v: string) => setNewBatch({ ...newBatch, mentor_id: v })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg mt-4">Launch Batch</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditLeadModal({ lead, onClose, onUpdate, courses, webinars }: any) {
    const [form, setForm] = useState({
        name: lead.name || '',
        email: lead.email || '',
        whatsapp: lead.whatsapp || '',
        city: lead.city || '',
        lead_status: lead.lead_status || 'cold',
        assigned_to: lead.assigned_to || '',
        course_id: lead.course_id || '',
        webinar_id: lead.webinar_id || '',
        follow_up_notes: lead.follow_up_notes || ''
    });
    const [loading, setLoading] = useState(false);

    const submit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.webinar.updateLead(lead.id, form);
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to update lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-heading">Edit Lead Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={submit} className="space-y-5">
                    <FormInput label="Full Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="WhatsApp" value={form.whatsapp} onChange={(v: string) => setForm({ ...form, whatsapp: v })} />
                        <FormInput label="Email Address" type="email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
                    </div>
                    <FormInput label="City / Location" value={form.city} onChange={(v: string) => setForm({ ...form, city: v })} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={form.lead_status}
                                onChange={(e) => setForm({ ...form, lead_status: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer"
                            >
                                <option value="cold">Cold Lead</option>
                                <option value="warm">Warm Interest</option>
                                <option value="hot">Hot / Ready</option>
                                <option value="converted">Converted</option>
                                <option value="dead">Dead / Invalid</option>
                            </select>
                        </div>
                        <FormInput label="Assigned To" value={form.assigned_to} onChange={(v: string) => setForm({ ...form, assigned_to: v })} />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Associated Course</label>
                        <select
                            value={form.course_id}
                            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="">-- No Course --</option>
                            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign to Webinar / Event (Push to Session)</label>
                        <select
                            value={form.webinar_id}
                            onChange={(e) => setForm({ ...form, webinar_id: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="">-- No Webinar --</option>
                            {webinars.map((w: any) => <option key={w.id} value={w.id}>{w.title} ({new Date(w.date).toLocaleDateString()})</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Follow-up Notes</label>
                        <textarea
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium outline-none h-24"
                            placeholder="Add notes..."
                            value={form.follow_up_notes}
                            onChange={e => setForm({ ...form, follow_up_notes: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest mt-6 shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">Cancel</button>
                </form>
            </div>
        </div>
    );
}

function StatCard({ label, val, icon, onClick, color = "bg-white" }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:scale-105 hover:shadow-xl group relative overflow-hidden ${color}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">{icon}</div>
            </div>
            <p className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-slate-900 relative z-10">{val}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">{label}</p>
        </button>
    );
}

function StatusBadge({ status }: any) {
    const colors: any = {
        cold: 'bg-slate-100 text-slate-500',
        warm: 'bg-orange-50 text-orange-500',
        hot: 'bg-red-50 text-red-500',
        enrolled: 'bg-emerald-50 text-emerald-500'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[status] || colors.cold}`}>
            {status}
        </span>
    );
}






function EnrolledView({ users }: any) {
    const students = users.filter((u: any) => u.plan !== 'FREE');
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold font-heading text-slate-900 uppercase mb-8">Enrolled Student Overview</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 font-heading">
                        <tr>
                            <th className="px-8 py-5">Student</th>
                            <th className="px-8 py-5">Plan / Course</th>
                            <th className="px-8 py-5">Fees Status</th>
                            <th className="px-8 py-5 text-right">Joining Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">No enrolled students found.</td>
                            </tr>
                        ) : students.map((s: any) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                            {s.full_name?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{s.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-medium text-slate-400 lowercase">{s.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase">
                                        {s.plan} Member
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-2 w-fit",
                                        s.subscription_status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    )}>
                                        {s.subscription_status === 'ACTIVE' ? <CheckCircle size={10} /> : <X size={10} />}
                                        {s.subscription_status || 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right text-[10px] text-slate-400 font-bold">
                                    {new Date(s.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AddUserModal = ({ onClose, onAdd, courses }: any) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        plan: 'FREE',
        amount: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onAdd(formData);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-heading text-slate-900">Add New Student</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                        <input required className="w-full px-4 py-3 bg-slate-50 rounded-xl border-slate-200 outline-none text-sm font-bold" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                        <input required type="email" className="w-full px-4 py-3 bg-slate-50 rounded-xl border-slate-200 outline-none text-sm font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                        <input required className="w-full px-4 py-3 bg-slate-50 rounded-xl border-slate-200 outline-none text-sm font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plan / Course</label>
                        <select className="w-full px-4 py-3 bg-slate-50 rounded-xl border-slate-200 outline-none text-sm font-bold" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="FREE">Free Plan</option>
                            <option disabled>──────</option>
                            {courses.map((c: any) => <option key={c.id} value={c.name}>{c.name} (₹{c.price})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-200">
                        Create User
                    </button>
                </form>
            </div>
        </div>
    );
};

function UsersView({ users, courses, onUpdate }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const ITEMS_PER_PAGE = 30;

    const handlePlanChange = async (userId: string, newPlan: string) => {
        if (!window.confirm(`Are you sure you want to change this user's plan to ${newPlan}?`)) return;
        try {
            const isPaid = newPlan !== 'FREE';
            await api.users.updateProfile(userId, {
                plan: newPlan,
                subscription_status: isPaid ? 'ACTIVE' : 'INACTIVE'
            });
            onUpdate();
        } catch (err) {
            alert('Failed to update plan');
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        if (!window.confirm('Change role?')) return;
        try {
            const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
            await api.users.updateProfile(userId, { role: nextRole });
            onUpdate();
        } catch (err) { alert('Failed'); }
    };

    const handleAddUser = async (data: any) => {
        await api.users.create({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            plan: data.plan,
            role: 'USER',
            subscription_status: data.plan !== 'FREE' ? 'ACTIVE' : 'INACTIVE',
            created_at: new Date().toISOString()
        });
        onUpdate();
    };

    const filtered = users.filter((u: any) =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAddUser} courses={courses} />}
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight font-heading">Member Registry</h3>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search users..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-full md:w-64 focus:outline-none"
                        />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                        <Plus size={16} /> Add Student
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:hidden gap-4 p-4">
                {paginated.map((u: any) => (
                    <div key={u.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600 shadow-sm shrink-0">
                                {u.full_name?.[0] || u.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-900 text-lg">{u.full_name || 'Anonymous'}</p>
                                <p className="text-xs font-bold text-slate-400 lowercase truncate">{u.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleRole(u.id, u.role)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all", u.role === 'ADMIN' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                {u.role || 'USER'}
                            </button>
                            <select
                                value={u.plan || 'FREE'}
                                onChange={(e) => handlePlanChange(u.id, e.target.value)}
                                className={cn("flex-[2] py-3 px-4 rounded-xl text-[10px] font-bold uppercase border outline-none cursor-pointer transition-all appearance-none text-center",
                                    u.plan !== 'FREE' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                )}
                            >
                                <option value="FREE">Free Plan</option>
                                <option disabled>──────</option>
                                {courses.map((c: any) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                                <option value="PREMIUM">Premium</option>
                                <option value="PRO">Pro</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 font-heading">
                        <tr>
                            <th className="px-8 py-5">User</th>
                            <th className="px-8 py-5">Role</th>
                            <th className="px-8 py-5">Plan</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginated.map((u: any) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                            {u.full_name?.[0] || u.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{u.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-medium text-slate-400 lowercase">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button onClick={() => toggleRole(u.id, u.role)} className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all", u.role === 'ADMIN' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                                        {u.role || 'USER'}
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <select
                                        value={u.plan || 'FREE'}
                                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                                        className={cn("px-3 py-1 rounded-lg text-[9px] font-bold uppercase border outline-none cursor-pointer hover:bg-slate-50 transition-all",
                                            u.plan !== 'FREE' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}
                                    >
                                        <option value="FREE">Free Plan</option>
                                        <option disabled>──────</option>
                                        {courses.map((c: any) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                        <option value="PREMIUM">Premium</option>
                                        <option value="PRO">Pro</option>
                                    </select>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all rounded-xl hover:bg-slate-100">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginated.length < filtered.length && (
                    <div className="p-4 flex justify-center border-t border-slate-100">
                        <button onClick={() => setPage(p => p + 1)} className="text-xs font-bold text-emerald-600">Load More</button>
                    </div>
                )}
            </div>
        </div>
    )
}
