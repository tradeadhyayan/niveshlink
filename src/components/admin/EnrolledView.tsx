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
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAddUser} courses={courses} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-slate-900 uppercase">Student Management</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{filtered.length} Students</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students..."
                            className="w-full md:w-64 pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                        />
                    </div>
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none uppercase text-slate-600 cursor-pointer"
                    >
                        <option value="All">All Plans</option>
                        <option value="FREE">Free Users</option>
                        {courses.map((c: any) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                        <Plus size={16} /> Add Student
                    </button>
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
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
                        {paginated.length === 0 ? (
                            <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">No students found.</td></tr>
                        ) : paginated.map((s: any) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm">{s.full_name?.[0] || 'S'}</div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{s.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-medium text-slate-400 lowercase">{s.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <select
                                        value={s.plan || 'FREE'}
                                        onChange={(e) => handlePlanChange(s.id, e.target.value)}
                                        className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border outline-none cursor-pointer transition-all",
                                            s.plan !== 'FREE' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}
                                    >
                                        <option value="FREE">Free Member</option>
                                        <option disabled>──────</option>
                                        {courses.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-2 w-fit",
                                        s.subscription_status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    )}>
                                        {s.subscription_status === 'ACTIVE' ? <CheckCircle size={10} /> : <X size={10} />}
                                        {s.subscription_status || 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right text-[10px] text-slate-400 font-bold">{new Date(s.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginated.length < filtered.length && (
                    <div className="p-4 flex justify-center border-t border-slate-100">
                        <button onClick={() => setPage(p => p + 1)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Load More</button>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 animate-in fade-in zoom-in duration-300 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-heading text-slate-900">Add New Student</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Full Name</label>
                        <input required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-transparent outline-none text-sm font-bold focus:bg-white focus:border-emerald-500/20 border transition-all" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Email</label>
                        <input required type="email" className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-transparent outline-none text-sm font-bold focus:bg-white focus:border-emerald-500/20 border transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Phone</label>
                        <input required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-transparent outline-none text-sm font-bold focus:bg-white focus:border-emerald-500/20 border transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Plan / Course</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-transparent outline-none text-sm font-bold focus:bg-white focus:border-emerald-500/20 border transition-all cursor-pointer" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="FREE">Free Plan</option>
                            <option disabled>──────</option>
                            {courses.map((c: any) => <option key={c.id} value={c.name}>{c.name} (₹{c.price})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 mt-4">Create User</button>
                </form>
            </div>
        </div>
    );
};
