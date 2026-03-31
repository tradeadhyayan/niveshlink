import { useState, useEffect } from 'react';
import {
    RefreshCcw,
    Users, CheckCircle2,
    LayoutDashboard, ClipboardList,
    Plus, HandCoins,
    Lock, Mail, ShieldCheck, Video, BarChart3, TrendingDown, Globe,
    LogOut, Menu, Briefcase, ChevronRight, Calendar
} from 'lucide-react';
import { api, supabase } from '../lib/api';
import { cn } from '../lib/utils';

// Shared Components & Types
import type { Tab } from '../components/admin/AdminShared';

// Extracted Views
import { lazy, Suspense } from 'react';

// Extracted Views (Lazy Loaded)
const DashboardView = lazy(() => import('../components/admin/DashboardView').then(module => ({ default: module.DashboardView })));
const CRMView = lazy(() => import('../components/admin/CRMView').then(module => ({ default: module.CRMView })));
const WebinarsView = lazy(() => import('../components/admin/WebinarsView').then(module => ({ default: module.WebinarsView })));
const TasksView = lazy(() => import('../components/admin/TasksView').then(module => ({ default: module.TasksView })));
const FeesView = lazy(() => import('../components/admin/FeesView').then(module => ({ default: module.FeesView })));
const CoursesView = lazy(() => import('../components/admin/CoursesView').then(module => ({ default: module.CoursesView })));
const BatchesView = lazy(() => import('../components/admin/BatchesView').then(module => ({ default: module.BatchesView })));
const EnrolledView = lazy(() => import('../components/admin/EnrolledView').then(module => ({ default: module.EnrolledView })));
const CalendarView = lazy(() => import('../components/admin/CalendarView').then(module => ({ default: module.CalendarView })));
const AnalyticsView = lazy(() => import('../components/admin/AnalyticsView').then(module => ({ default: module.AnalyticsView })));
const ExpensesView = lazy(() => import('../components/admin/ExpensesView').then(module => ({ default: module.ExpensesView })));
const LandingView = lazy(() => import('../components/admin/LandingView').then(module => ({ default: module.LandingView })));

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
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Restricted to authorized personnel only.</p>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl outline-none text-sm font-bold" />
                        </div>
                        <button type="submit" disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold uppercase tracking-wider shadow-lg hover:bg-emerald-600 transition-colors">
                            {authLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Unlock Dashboard')}
                        </button>
                    </form>
                    <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-emerald-600 transition-colors">
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

    const [crmSubTab, setCrmSubTab] = useState<'events' | 'demo' | 'follow_up' | 'all'>('events');

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
        { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
        { id: 'crm', label: 'CRM Leads', icon: <Users size={20} /> },
        { id: 'enrolled', label: 'Students', icon: <CheckCircle2 size={20} /> },
        { id: 'webinars', label: 'Webinars', icon: <Video size={20} /> },
        { id: 'tasks', label: 'Task Center', icon: <ClipboardList size={20} /> },
        { id: 'fees', label: 'Collections', icon: <HandCoins size={20} /> },
        { id: 'courses', label: 'Courses', icon: <Briefcase size={20} /> },
        { id: 'batches', label: 'Active Batches', icon: <Plus size={20} /> },
        { id: 'analytics', label: 'Intelligence', icon: <BarChart3 size={20} /> },
        { id: 'landing', label: 'Landing Page', icon: <Globe size={20} /> },
        { id: 'expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
    ];

    const renderContent = () => {
        if (loading) return <div className="flex-1 flex items-center justify-center bg-slate-50"><RefreshCcw className="animate-spin text-emerald-600" /></div>;
        switch (activeTab) {
            case 'dashboard': return <DashboardView setActiveTab={setActiveTab} setCrmSubTab={setCrmSubTab} />;
            case 'calendar': return <CalendarView />;
            case 'crm': return <CRMView webinars={webinars} courses={courses} initialTab={crmSubTab} />;
            case 'webinars': return <WebinarsView webinars={webinars} onUpdate={fetchData} />;
            case 'tasks': return <TasksView tasks={tasks} onUpdate={fetchData} />;
            case 'fees': return <FeesView onUpdate={fetchData} />;
            case 'courses': return <CoursesView courses={courses} onUpdate={fetchData} />;
            case 'batches': return <BatchesView batches={batches} courses={courses} onUpdate={fetchData} />;
            case 'enrolled': return <EnrolledView users={users} courses={courses} onUpdate={fetchData} />;
            case 'analytics': return <AnalyticsView />;
            case 'landing': return <LandingView />;
            case 'expenses': return <ExpensesView />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-body text-slate-900 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none",
                !isSidebarOpen && "-translate-x-full"
            )}>
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black font-heading text-slate-900 tracking-tight">NIVESH LINK</h1>
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider leading-none mt-1.5 ml-0.5">ADMIN TERMINAL</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as Tab); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all group relative overflow-hidden",
                                activeTab === item.id ? "bg-gradient-to-r from-emerald-50 to-white text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                            )}
                        >
                            <span className={cn("transition-colors", activeTab === item.id ? "text-emerald-600" : "group-hover:text-emerald-500")}>{item.icon}</span>
                            {item.label}
                            {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-70" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-black border border-slate-200 shrink-0 uppercase">{session?.user?.email?.[0]}</div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black truncate text-slate-900">{session?.user?.email}</p>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight block mt-0.5">Super Admin</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"><LogOut size={18} /> Sign Out</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-20 md:h-24 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 lg:hidden hover:bg-slate-50 rounded-xl text-slate-500"><Menu size={28} /></button>
                        <h2 className="text-xl font-black font-heading text-slate-900 uppercase tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><RefreshCcw className="animate-spin text-emerald-500" /></div>}>
                            {renderContent()}
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}
