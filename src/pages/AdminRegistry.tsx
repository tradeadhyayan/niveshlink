import { useState, useEffect } from 'react';
import {
    RefreshCcw,
    Users, CheckCircle2,
    LayoutDashboard, ClipboardList,
    Plus, HandCoins,
    Lock, Mail, ShieldCheck, Video,
    LogOut, Menu, Briefcase, ChevronRight
} from 'lucide-react';
import { api, supabase } from '../lib/api';
import { cn } from '../lib/utils';

// Shared Components & Types
import type { Tab } from '../components/admin/AdminShared';

// Extracted Views
import { DashboardView } from '../components/admin/DashboardView';
import { CRMView } from '../components/admin/CRMView';
import { WebinarsView } from '../components/admin/WebinarsView';
import { TasksView } from '../components/admin/TasksView';
import { FeesView } from '../components/admin/FeesView';
import { CoursesView } from '../components/admin/CoursesView';
import { BatchesView } from '../components/admin/BatchesView';
import { EnrolledView } from '../components/admin/EnrolledView';

export default function AdminDashboard() {
    const [session, setSession] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const AUTHORIZED_EMAILS = ['niveshlink.edu@gmail.com', 'Niveshlink.co@gmail.com'];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email && !AUTHORIZED_EMAILS.includes(session.user.email)) {
                supabase.auth.signOut();
                setSession(null);
            } else {
                setSession(session);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user?.email && !AUTHORIZED_EMAILS.includes(session.user.email)) {
                supabase.auth.signOut();
                setSession(null);
            } else {
                setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!AUTHORIZED_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
            alert('This email is not authorized for Admin access.');
            return;
        }

        setAuthLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email: cleanEmail, password,
                options: { data: { full_name: 'Admin User' } }
            });
            if (error) alert(error.message);
            else alert('Account created! Please check your email.');
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
            if (error) alert(error.message);
        }
        setAuthLoading(false);
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
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Restricted to authorized personnel only.</p>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold" />
                        </div>
                        <button type="submit" disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-colors">
                            {authLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Unlock Dashboard')}
                        </button>
                    </form>
                    <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600">
                        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        );
    }

    return <AdminDashboardContent session={session} onLogout={() => supabase.auth.signOut()} />;
}

function AdminDashboardContent({ session, onLogout }: any) {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [tasks, setTasks] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [webinars, setWebinars] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tks, crs, bts, webs, usrs] = await Promise.all([
                api.tasks.getAll(), api.courses.getAll(), api.batches.getAll(), api.webinar.getAll(), api.users.list()
            ]);
            setTasks(tks || []); setCourses(crs || []); setBatches(bts || []); setWebinars(webs || []); setUsers(usrs || []);
        } catch (err: any) { console.error('Data fetch error:', err); } finally { setLoading(false); }
    };

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { id: 'crm', label: 'CRM Leads', icon: <Users size={20} /> },
        { id: 'enrolled', label: 'Students', icon: <CheckCircle2 size={20} /> },
        { id: 'webinars', label: 'Webinars', icon: <Video size={20} /> },
        { id: 'tasks', label: 'Task Center', icon: <ClipboardList size={20} /> },
        { id: 'fees', label: 'Collections', icon: <HandCoins size={20} /> },
        { id: 'courses', label: 'Courses', icon: <Briefcase size={20} /> },
        { id: 'batches', label: 'Active Batches', icon: <Plus size={20} /> },
    ];

    const renderContent = () => {
        if (loading) return <div className="flex-1 flex items-center justify-center bg-slate-50"><RefreshCcw className="animate-spin text-emerald-600" /></div>;
        switch (activeTab) {
            case 'dashboard': return <DashboardView setActiveTab={setActiveTab} />;
            case 'crm': return <CRMView />;
            case 'webinars': return <WebinarsView webinars={webinars} onUpdate={fetchData} />;
            case 'tasks': return <TasksView tasks={tasks} onUpdate={fetchData} />;
            case 'fees': return <FeesView onUpdate={fetchData} />;
            case 'courses': return <CoursesView courses={courses} onUpdate={fetchData} />;
            case 'batches': return <BatchesView batches={batches} courses={courses} onUpdate={fetchData} />;
            case 'enrolled': return <EnrolledView users={users} courses={courses} onUpdate={fetchData} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-body text-slate-900 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-sm",
                !isSidebarOpen && "-translate-x-full"
            )}>
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-heading text-slate-800 tracking-tight">Nivesh Link</h1>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as Tab); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group",
                                activeTab === item.id ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <span className={cn("transition-colors", activeTab === item.id ? "text-emerald-600" : "group-hover:text-emerald-500")}>{item.icon}</span>
                            {item.label}
                            {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-70" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0">{session?.user?.email?.[0].toUpperCase()}</div>
                        <div className="overflow-hidden">
                            <p className="text-[11px] font-bold truncate text-slate-800">{session?.user?.email}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Super Admin</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"><LogOut size={16} /> Sign Out</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 md:h-20 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden hover:bg-slate-50 rounded-xl text-slate-500"><Menu size={24} /></button>
                        <h2 className="text-lg font-bold font-heading text-slate-800 uppercase tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Server Live</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">{renderContent()}</div>
                </main>
            </div>
        </div>
    );
}
