import React from 'react';
import { cn } from '../../lib/utils';

export type Tab = 'dashboard' | 'crm' | 'enrolled' | 'webinars' | 'tasks' | 'fees' | 'courses' | 'batches' | 'seminars';

interface StatCardProps {
    label: string;
    val: string | number;
    icon: React.ReactNode;
    onClick: () => void;
    color?: string;
}

export const StatCard = ({ label, val, icon, onClick, color = "bg-white" }: StatCardProps) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 group relative overflow-hidden backdrop-blur-sm",
            color
        )}
    >
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 transform rotate-12">
            {icon}
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 group-hover:bg-white transition-colors duration-300 transform group-hover:-rotate-3">
                {icon}
            </div>
        </div>
        <p className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-slate-900 relative z-10 group-hover:text-emerald-700 transition-colors">{val}</p>
        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 relative z-10 group-hover:text-slate-600">{label}</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </button>
);

export const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
        cold: 'bg-slate-100 text-slate-500',
        warm: 'bg-orange-50 text-orange-500',
        hot: 'bg-red-50 text-red-500',
        enrolled: 'bg-emerald-50 text-emerald-500',
        converted: 'bg-emerald-100 text-emerald-700',
        dead: 'bg-slate-200 text-slate-400'
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", colors[status.toLowerCase()] || colors.cold)}>
            {status}
        </span>
    );
};

export const FormInput = ({ label, type = "text", placeholder, value, onChange, required = true }: any) => (
    <div className="space-y-1.5 text-left">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            required={required}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/20 transition-all border shadow-small"
        />
    </div>
);
