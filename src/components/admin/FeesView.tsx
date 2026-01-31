import { useState, useEffect } from 'react';
import { Search, Receipt, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function FeesView({ onUpdate }: any) {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [newAmount, setNewAmount] = useState('');
    const [editingIns, setEditingIns] = useState<any>(null);
    const LIMIT = 50;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchFees();
    }, [page, debouncedSearch]);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const result = await api.webinar.getFeesPaginated({
                page,
                limit: LIMIT,
                query: debouncedSearch
            });
            if (result?.data) {
                setRegistrations(result.data);
                if (result.count !== null) setTotal(result.count);
            }
        } catch (err) { console.error('Fees fetch error:', err); } finally { setLoading(false); }
    };

    const openInvoices = async (student: any) => {
        setSelectedStudent(student);
        const data = await api.fees.getInstallments(student.id);
        setInstallments(data || []);
    };

    const addPayment = async () => {
        if (!newAmount || !selectedStudent) return;
        try {
            await api.fees.addInstallment({
                registration_id: selectedStudent.id,
                amount: Number(newAmount),
                payment_date: new Date().toISOString()
            });
            setNewAmount('');
            openInvoices(selectedStudent);
            fetchFees();
            if (onUpdate) onUpdate();
        } catch (err) { alert('Failed to record payment'); }
    };

    const handleUpdateIns = async (e: any) => {
        e.preventDefault();
        try {
            await api.fees.updateInstallment(editingIns.id, { amount: Number(editingIns.amount) });
            setEditingIns(null);
            openInvoices(selectedStudent);
            fetchFees();
            if (onUpdate) onUpdate();
        } catch (err) { alert('Update failed'); }
    };

    const handleDeleteIns = async (id: string) => {
        if (!window.confirm('Delete this installment?')) return;
        try {
            await api.fees.deleteInstallment(id, selectedStudent.id);
            openInvoices(selectedStudent);
            fetchFees();
            if (onUpdate) onUpdate();
        } catch (err) { alert('Delete failed'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-slate-900 uppercase">Fee Collection</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{total} Enrolled Students</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search student..."
                        className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course / Plan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px]">No enrolled students found</td></tr>
                            ) : registrations.map((reg: any) => {
                                const coursePrice = reg.courses?.price || 0;
                                const balance = coursePrice - (reg.fees_paid || 0);
                                return (
                                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600">{reg.name?.[0] || 'S'}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{reg.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{reg.whatsapp}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{reg.courses?.name || 'Manual Enrollment'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-emerald-600">₹{Number(reg.fees_paid || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("text-sm font-bold", balance > 0 ? "text-orange-500" : "text-slate-300")}>₹{balance.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => openInvoices(reg)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-slate-200">History / Add</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Showing {registrations.length} of {total} records</p>
                    <div className="flex items-center gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-2.5 bg-white border border-slate-200 rounded-xl"><ChevronLeft size={18} /></button>
                        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">Page {page} of {Math.ceil(total / LIMIT)}</div>
                        <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(prev => prev + 1)} className="p-2.5 bg-white border border-slate-200 rounded-xl"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold font-heading">{selectedStudent.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedStudent.courses?.name || 'Manual Enrollment'}</p>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={24} className="text-slate-400" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-5 rounded-2xl">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Course Fee</p>
                                <p className="text-xl font-bold">₹{(selectedStudent.courses?.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-600">
                                <p className="text-[9px] font-bold uppercase tracking-widest mb-1">Total Collected</p>
                                <p className="text-xl font-bold">₹{(selectedStudent.fees_paid || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto no-scrollbar">
                            {installments.map((ins: any) => (
                                <div key={ins.id} className="group bg-slate-50 p-4 rounded-2xl flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                <Receipt size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">₹{Number(ins.amount).toLocaleString()}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ins.payment_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingIns(ins)} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-emerald-600 transition-colors"><X className="rotate-45" size={14} /></button>
                                            <button onClick={() => handleDeleteIns(ins.id)} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    {editingIns?.id === ins.id && (
                                        <form onSubmit={handleUpdateIns} className="flex gap-2">
                                            <input
                                                type="number"
                                                value={editingIns.amount}
                                                onChange={e => setEditingIns({ ...editingIns, amount: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                            />
                                            <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase">Save</button>
                                            <button type="button" onClick={() => setEditingIns(null)} className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-[9px] font-bold uppercase">X</button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 text-left">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Record New Payment</label>
                            <div className="flex gap-3">
                                <input type="number" placeholder="Amount..." value={newAmount} onChange={e => setNewAmount(e.target.value)} className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none" />
                                <button onClick={addPayment} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase">Collect</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
