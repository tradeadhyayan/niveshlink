import { useState, useEffect } from 'react';
import { Search, Receipt, X, ChevronLeft, ChevronRight, Trash2, ClipboardPaste } from 'lucide-react';
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
    const [newMethod, setNewMethod] = useState('UPI');
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
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
                method: newMethod,
                payment_date: new Date().toISOString()
            });
            setNewAmount('');
            openInvoices(selectedStudent);
            fetchFees();
            if (onUpdate) onUpdate();
        } catch (err) { alert('Failed to record payment'); }
    };

    const printReceipt = (ins: any, student: any) => {
        const win: any = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Receipt - ${student.name}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .receipt { border: 2px solid #eee; padding: 40px; max-width: 600px; margin: auto; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px; }
                        .total { font-size: 24px; font-weight: bold; margin-top: 30px; text-align: right; }
                        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>NIVESH LINK</h1>
                            <p>Learning & Growth Academy</p>
                        </div>
                        <div class="row"><span>Date:</span> <b>${new Date(ins.payment_date).toLocaleDateString()}</b></div>
                        <div class="row"><span>Student Name:</span> <b>${student.name}</b></div>
                        <div class="row"><span>Course:</span> <b>${student.courses?.name || 'Education Service'}</b></div>
                        <div class="row"><span>Payment Method:</span> <b>${ins.method || 'Online'}</b></div>
                        <div class="row"><span>Transaction ID:</span> <b>${ins.id.split('-')[0].toUpperCase()}</b></div>
                        <div class="total">Amount Received: ₹${Number(ins.amount).toLocaleString()}</div>
                        <div class="footer">This is a computer generated receipt. Thank you for your payment!</div>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    const handleDeleteIns = async (id: string) => {
        if (!window.confirm('Delete this installment?')) return;
        try {
            await api.fees.deleteInstallment(id, selectedStudent.id);
            openInvoices(selectedStudent);
            fetchFees();
        } catch (err) { alert('Failed to delete'); }
    };

    const handleUpdateIns = async (e: any) => {
        e.preventDefault();
        try {
            await api.fees.updateInstallment(editingIns.id, { amount: Number(editingIns.amount) });
            setEditingIns(null);
            openInvoices(selectedStudent);
            fetchFees();
        } catch (err) { alert('Failed to update'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
                <div>
                    <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tight">Fee Collections</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mt-2">{total} Ledger Records</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search student ledger..."
                            className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-emerald-500/20 transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={() => setShowPaste(true)} className="px-8 py-4.5 bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
                        <ClipboardPaste size={18} /> Bulk Inflow
                    </button>
                    <button onClick={() => setShowAddStudent(true)} className="px-8 py-4.5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                        <Receipt size={18} /> Add Record
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">Student Profile</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">Enrollment Meta</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">Total Paid</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">Ledger Balance</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-40 text-center"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" /><p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-6">Accessing Financial Vault...</p></td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={5} className="py-40 text-center text-slate-300 font-black uppercase text-sm tracking-[0.3em] bg-slate-50/30 italic">No Enrolled Records Found</td></tr>
                            ) : registrations.map((reg: any) => {
                                const coursePrice = reg.courses?.price || 0;
                                const balance = coursePrice - (reg.fees_paid || 0);
                                return (
                                    <tr key={reg.id} className="hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-emerald-500">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-700 shadow-sm transition-all group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-700 uppercase">{reg.name?.[0] || 'S'}</div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">{reg.name}</p>
                                                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider">{reg.whatsapp}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{reg.courses?.name || 'Direct Manual Entry'}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-emerald-600 tracking-tighter">₹{Number(reg.fees_paid || 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Inflow</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className={cn("text-lg font-black tracking-tighter", balance > 0 ? "text-rose-500" : "text-slate-300")}>₹{balance.toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Payable</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button onClick={() => openInvoices(reg)} className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                                                View Intel / Add
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Audit Surface {registrations.length} of {total} Entries</p>
                    <div className="flex items-center gap-4">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"><ChevronLeft size={24} /></button>
                        <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm">Index {page} of {Math.ceil(total / LIMIT)}</div>
                        <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(prev => prev + 1)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"><ChevronRight size={24} /></button>
                    </div>
                </div>
            </div>

            {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} onUpdate={fetchFees} />}

            {selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 md:p-16 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <h3 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tight">{selectedStudent.name}</h3>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2 leading-none">{selectedStudent.courses?.name || 'Manual Enrollment'}</p>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-4 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={32} /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                            <div className="bg-slate-100/80 p-8 rounded-[2.5rem] border border-slate-200">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Total Payable</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{(selectedStudent.courses?.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-wider mb-3">Cash Realized</p>
                                <p className="text-3xl font-black tracking-tighter">₹{(selectedStudent.fees_paid || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-12 max-h-[350px] overflow-y-auto no-scrollbar relative z-10 p-1">
                            {installments.map((ins: any) => (
                                <div key={ins.id} className="group bg-slate-50 p-6 rounded-3xl flex flex-col gap-4 border border-slate-100 hover:bg-white hover:border-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                                                <Receipt size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-black text-slate-900 tracking-tight">₹{Number(ins.amount).toLocaleString()}</p>
                                                    <span className="text-[10px] font-black bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-600 border border-emerald-100 uppercase tracking-wider">{ins.method || 'UPI'}</span>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{new Date(ins.payment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => printReceipt(ins, selectedStudent)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider">Print</button>
                                            <button onClick={() => setEditingIns(ins)} className="p-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-slate-300 transition-all"><X className="rotate-45" size={18} /></button>
                                            <button onClick={() => handleDeleteIns(ins.id)} className="p-3 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-slate-300 transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    {editingIns?.id === ins.id && (
                                        <form onSubmit={handleUpdateIns} className="flex gap-3 animate-in fade-in duration-300">
                                            <input
                                                type="number"
                                                value={editingIns.amount}
                                                onChange={e => setEditingIns({ ...editingIns, amount: e.target.value })}
                                                className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                                            />
                                            <button type="submit" className="px-5 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider">Update</button>
                                            <button type="button" onClick={() => setEditingIns(null)} className="px-5 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-wider">X</button>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-100 relative z-10">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-4 block">Injection: New Payment Logic</label>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <input type="number" placeholder="Enter realized amount..." value={newAmount} onChange={e => setNewAmount(e.target.value)} className="flex-1 px-8 py-5 bg-slate-50 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/20 border transition-all" />
                                    <select value={newMethod} onChange={e => setNewMethod(e.target.value)} className="w-40 px-6 py-5 bg-slate-50 rounded-[1.5rem] text-xs font-black uppercase tracking-wider border transition-all cursor-pointer">
                                        <option value="UPI">UPI Hub</option>
                                        <option value="Cash">Physical Cash</option>
                                        <option value="Bank">Direct Bank</option>
                                        <option value="Other">External</option>
                                    </select>
                                </div>
                                <button onClick={addPayment} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">Collect & Audit Payment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPaste && (
                <PasteFeeImportModal
                    onClose={() => setShowPaste(false)}
                    onUpdate={() => { fetchFees(); if (onUpdate) onUpdate(); }}
                />
            )}
        </div>
    );
}

function AddStudentModal({ onClose, onUpdate }: any) {
    const [form, setForm] = useState({ name: '', whatsapp: '', email: '', course_id: '', initial_payment: '' });
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.courses.getAll().then(setCourses);
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const registration: any = await api.webinar.register({
                ...form,
                lead_status: 'enrolled',
                campaign_source: 'Manual'
            });

            if (form.initial_payment && registration?.id) {
                await api.fees.addInstallment({
                    registration_id: registration.id,
                    amount: Number(form.initial_payment),
                    method: 'Cash',
                    payment_date: new Date().toISOString()
                });
            }

            onUpdate();
            onClose();
        } catch (err: any) { alert('Failed to add student: ' + (err.message || 'Unknown error')); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative">
                <button onClick={onClose} className="absolute right-12 top-12 p-4 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={28} /></button>
                <div className="mb-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Manual Enrollment</h3>
                    <p className="text-xs font-black text-slate-400 font-bold uppercase tracking-wider mt-2 leading-none">Register a new identity in the database</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Student Full Name</label>
                        <input required placeholder="Enter full name..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-8 py-4.5 bg-slate-50 rounded-2xl text-sm font-bold border-slate-200 outline-none focus:bg-white border transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">WhatsApp Identity</label>
                        <input required placeholder="Phone number..." value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-8 py-4.5 bg-slate-50 rounded-2xl text-sm font-bold border-slate-200 outline-none focus:bg-white border transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Assign Program</label>
                        <select required value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="w-full px-8 py-4.5 bg-slate-50 rounded-2xl text-sm font-black uppercase tracking-wider border-slate-200 outline-none focus:bg-white border transition-all cursor-pointer">
                            <option value="">Select Target Course...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name} (₹{c.price})</option>)}
                        </select>
                    </div>
                    <div className="pb-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Initial Cash Realized (Optional)</label>
                        <input placeholder="Enter amount..." type="number" value={form.initial_payment} onChange={e => setForm({ ...form, initial_payment: e.target.value })} className="w-full px-8 py-4.5 bg-slate-50 rounded-2xl text-sm font-bold border-slate-200 outline-none focus:bg-white border transition-all" />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">{loading ? 'Processing...' : 'Instate Student'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
function PasteFeeImportModal({ onClose, onUpdate }: any) {
    const [pasteRaw, setPasteRaw] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pasteRaw.trim()) { setPreview([]); return; }
        const lines = pasteRaw.trim().split('\n');
        const parsed = lines.map(line => {
            const cols = line.split(/[\t,]/).map(p => p.trim());
            if (cols.length >= 2) {
                const amountCol = cols.find(c => /^\d+(\.\d+)?$/.test(c.replace(/[^\d.]/g, '')));
                const phoneCol = cols.find(c => c !== amountCol && c.replace(/\D/g, '').length >= 10);
                const nameCol = cols.find(c => c !== amountCol && c !== phoneCol && c.length > 2);

                const amount = parseFloat((amountCol || '').replace(/[^\d.]/g, ''));
                const phone = (phoneCol || '').replace(/\D/g, '');

                if (phone && !isNaN(amount)) {
                    return {
                        whatsapp: phone,
                        name: nameCol || 'Bulk Client',
                        amount: amount,
                        date: new Date().toISOString(),
                        method: 'Bulk Import'
                    };
                }
            }
            return null;
        }).filter(Boolean);
        setPreview(parsed);
    }, [pasteRaw]);

    const handleSync = async () => {
        setLoading(true);
        try {
            await api.fees.importBulk(preview);
            onUpdate();
            onClose();
        } catch (err: any) { alert('Import failed: ' + (err.message || 'Unknown error')); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-[4rem] p-12 md:p-16 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">
                <button onClick={onClose} className="absolute right-12 top-12 p-5 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={36} /></button>

                <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-xl border border-indigo-100"><ClipboardPaste size={40} /></div>
                    <div>
                        <h3 className="text-4xl font-black font-heading tracking-tight uppercase">Bulk Operations Hub</h3>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none mt-3">High-Volume Financial Records Import</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 flex-1 overflow-hidden">
                    <div className="flex flex-col gap-6">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Terminal Data Feed (Paste Columns)</label>
                        <textarea
                            value={pasteRaw}
                            onChange={(e) => setPasteRaw(e.target.value)}
                            placeholder="PhoneNo  Amount  ClientName  Method..."
                            className="w-full flex-1 p-8 bg-slate-50 border border-slate-200 rounded-[3rem] text-base font-bold outline-none focus:bg-white focus:border-indigo-500/20 transition-all resize-none shadow-inner leading-relaxed"
                        />
                    </div>

                    <div className="flex flex-col gap-10 overflow-hidden">
                        <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 p-8 rounded-[3rem] no-scrollbar shadow-inner">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 px-2">Verification Stream ({preview.length} Entries)</h4>
                            <div className="space-y-4">
                                {preview.slice(0, 50).map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500/30 transition-all">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{p.whatsapp}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600 tracking-tighter">₹{p.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(p.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {preview.length > 50 && <p className="text-xs text-center font-black text-slate-400 uppercase mt-8 bg-white/50 py-4 rounded-xl">... access high volume stream restricted ...</p>}
                                {preview.length === 0 && <p className="text-sm text-center font-black text-slate-300 uppercase mt-20 italic bg-white/50 py-10 rounded-[2rem]">Awaiting Data Feed Synchronization</p>}
                            </div>
                        </div>

                        <button disabled={loading || !preview.length} onClick={handleSync} className="w-full py-8 bg-emerald-600 text-white rounded-[3rem] text-sm font-black uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(5,150,105,0.4)] hover:bg-emerald-700 transition-all active:scale-95">
                            {loading ? 'Processing Security Clearance...' : `Execute ${preview.length} Bulk Transactions`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
