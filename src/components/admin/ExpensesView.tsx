import { useState, useEffect } from 'react';
import { Plus, Trash2, IndianRupee, Tag, TrendingDown, FileText, X, RefreshCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { FormInput } from './AdminShared';

export function ExpensesView() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: 'Ads',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        source: 'Marketing'
    });

    const categories = ['Ads', 'Salary', 'Infrastructure', 'Software', 'Rent', 'Utilities', 'Other'];

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await api.expenses.list();
            setExpenses(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await api.expenses.create({
                ...newExpense,
                amount: Number(newExpense.amount)
            });
            setShowAdd(false);
            setNewExpense({ category: 'Ads', amount: '', description: '', date: new Date().toISOString().split('T')[0], source: 'Marketing' });
            fetchExpenses();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this expense record?')) {
            await api.expenses.delete(id);
            fetchExpenses();
        }
    };

    const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    if (loading) return (
        <div className="py-40 text-center">
            <RefreshCcw className="animate-spin h-10 w-10 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-wider text-[10px]">Syncing Commerce Data...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-[2rem] shadow-sm">
                        <TrendingDown size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black font-heading tracking-tight text-slate-900">Expense Journal</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Operational Outflow Tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Burn</p>
                        <p className="text-xl font-black text-rose-600">₹{totalExpense.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                        <Plus size={18} /> Record Flow
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date & Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Source</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Draft</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenses.length > 0 ? expenses.map((exp: any) => (
                                <tr key={exp.id} className="hover:bg-slate-50/80 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                                <Tag size={10} /> {exp.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-semibold text-slate-600 italic">"{exp.description || 'No notes added'}"</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-200">
                                            {exp.source || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-lg font-black text-slate-900 tracking-tight">₹{Number(exp.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button onClick={() => handleDelete(exp.id)} className="p-3 bg-slate-50 hover:bg-rose-500 hover:text-white rounded-2xl text-slate-300 transition-all shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <FileText size={48} />
                                            <p className="text-xs font-black uppercase tracking-wider">No commercial flows recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
                        <button onClick={() => setShowAdd(false)} className="absolute right-8 top-8 p-3 hover:bg-slate-100 rounded-2xl transition-all">
                            <X size={24} className="text-slate-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl shadow-inner">
                                <IndianRupee size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">New Expense</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Record Financial Outflow</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Spending Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider outline-none focus:border-rose-500/20 transition-all cursor-pointer"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <FormInput
                                label="Amount (INR)"
                                type="number"
                                placeholder="0.00"
                                value={newExpense.amount}
                                onChange={(v: any) => setNewExpense({ ...newExpense, amount: v })}
                            />

                            <FormInput
                                label="Expense Date"
                                type="date"
                                value={newExpense.date}
                                onChange={(v: any) => setNewExpense({ ...newExpense, date: v })}
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Flow Details</label>
                                <textarea
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="What was this for?"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold italic outline-none h-24 resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-wider shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all mt-4">
                                Confirm Debit Flow
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
