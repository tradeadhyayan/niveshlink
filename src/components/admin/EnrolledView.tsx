import React, { useState } from 'react';
import { Search, Plus, CheckCircle, X } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function EnrolledView({ users, courses, onUpdate }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [page, setPage] = useState(1);
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

    const handleAddUser = async (data: any) => {
        try {
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
        } catch (err: any) {
            console.error(err);
            alert('Failed to create user. Email might exist.');
        }
    };

    const filtered = users.filter((u: any) => {
        const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = filterCourse === 'All' || u.plan === filterCourse;
        return matchesSearch && matchesCourse;
    });

    const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAddUser} courses={courses} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                    <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tight">Student Management</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mt-2">{filtered.length} Enrolled Students</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students..."
                            className="w-full md:w-80 pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-indigo-500/20 transition-all"
                        />
                    </div>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-black uppercase outline-none text-slate-600 cursor-pointer hover:bg-white transition-all tracking-wider"
                    >
                        <option value="All">All Plans</option>
                        <option value="FREE">Free Users</option>
                        {courses.map((c: any) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                        <Plus size={18} /> Add Student
                    </button>
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-slate-100 shadow-inner">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-10 py-6 border-b border-slate-100">Student Profile</th>
                            <th className="px-10 py-6 border-b border-slate-100">Plan / Course</th>
                            <th className="px-10 py-6 border-b border-slate-100">Auth Status</th>
                            <th className="px-10 py-6 border-b border-slate-100 text-right">Entrance Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginated.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-wider bg-slate-50/50">No data found in vault</td></tr>
                        ) : paginated.map((s: any) => (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 shadow-md transform group-hover:rotate-6 transition-all">{s.full_name?.[0] || 'S'}</div>
                                        <div>
                                            <p className="font-black text-slate-900 text-base uppercase tracking-tight">{s.full_name || 'Anonymous'}</p>
                                            <p className="text-sm font-medium text-slate-500 lowercase mt-0.5">{s.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <select
                                        value={s.plan || 'FREE'}
                                        onChange={(e) => handlePlanChange(s.id, e.target.value)}
                                        className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase border outline-none cursor-pointer transition-all tracking-wider",
                                            s.plan !== 'FREE' ? "bg-indigo-600 text-white border-indigo-700 shadow-lg" : "bg-slate-100 text-slate-500 border-slate-200 shadow-sm"
                                        )}
                                    >
                                        <option value="FREE">Free Member</option>
                                        <option disabled>──────</option>
                                        {courses.map((c: any) => <option key={c.id} value={c.name} className="text-slate-900 bg-white">{c.name}</option>)}
                                    </select>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 w-fit shadow-sm tracking-wider",
                                        s.subscription_status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"
                                    )}>
                                        {s.subscription_status === 'ACTIVE' ? <CheckCircle size={12} /> : <X size={12} />}
                                        {s.subscription_status || 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right text-xs text-slate-500 font-bold uppercase tracking-wider">{new Date(s.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginated.length < filtered.length && (
                    <div className="p-8 flex justify-center bg-slate-50/30">
                        <button onClick={() => setPage(p => p + 1)} className="text-sm font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider transition-all">Expand Knowledge Base ({filtered.length - paginated.length} more)</button>
                    </div>
                )}
            </div>
        </div>
    );
}

const AddUserModal = ({ onClose, onAdd, courses }: any) => {
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', plan: 'FREE'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 md:p-16 animate-in fade-in zoom-in duration-300 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tight">Add Student</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-2">New Identity Creation</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={28} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Full Identity Name</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-slate-200 outline-none text-sm font-bold focus:bg-white focus:border-indigo-500/20 border transition-all shadow-sm" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Email Communication</label>
                        <input required type="email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-slate-200 outline-none text-sm font-bold focus:bg-white focus:border-indigo-500/20 border transition-all shadow-sm" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Direct Contact No.</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-slate-200 outline-none text-sm font-bold focus:bg-white focus:border-indigo-500/20 border transition-all shadow-sm" placeholder="+91 00000 00000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="pb-6">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 ml-1">Program Enrollment</label>
                        <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-slate-200 outline-none text-sm font-black uppercase tracking-wider focus:bg-white focus:border-indigo-500/20 border transition-all cursor-pointer shadow-sm" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="FREE">Free Access Tier</option>
                            <option disabled>──────</option>
                            {courses.map((c: any) => <option key={c.id} value={c.name} className="font-bold">{c.name} (₹{c.price})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full py-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-wider transition-all shadow-2xl active:scale-95">Instate New Record</button>
                </form>
            </div>
        </div>
    );
};
