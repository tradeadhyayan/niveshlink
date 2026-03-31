import { useState, useEffect } from 'react';
import { Save, Globe, Info, Gift, Map, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { FormInput } from './AdminShared';

export function LandingView() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>({
        hero: {
            title: "Want to start trading but feeling confused?",
            subtitle: "Get a clear, simple roadmap in our 90-Minute Live Webinar designed for absolute beginners."
        },
        roadmap: [
            { step: "1", title: "Foundations", items: ["Reality Check (90% Rule)", "Market Ecosystem", "Instruments & Equity"] },
            { step: "2", title: "Analysis & Strategy", items: ["Fundamental Pillars", "Technical Charts", "Breakout Strategies"] },
            { step: "3", title: "Execution", items: ["Risk Management", "Trading Journal", "Course Curriculum"] }
        ],
        rewards: [
            { title: "Portfolio Guide PDF" },
            { title: "Trading Checklist" },
            { title: "VIP Community Access" }
        ],
        schedule: {
            date: "7 Feb, Friday",
            time: "5 PM Sharp"
        },
        cta: {
            title: "Seats fill up fast.",
            button: "Register for Free Now"
        },
        footer: "Nivesh Link Coaching • 2026"
    });

    const [activeWebinar, setActiveWebinar] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [val, active] = await Promise.all([
                api.settings.get('landing_page_data'),
                api.webinar.getActive()
            ]);
            if (val) setData(val);
            if (active) setActiveWebinar(active);
        } catch (err) {
            console.error('Failed to load landing data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.settings.update('landing_page_data', data);
            alert('Landing page updated successfully! If you have multiple tabs open, please refresh the landing page.');
        } catch (err) {
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center uppercase tracking-wider text-slate-400 font-bold">Loading Scene Graph...</div>;

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm"><Globe size={24} /></div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Main Digital Surface</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Live Landing Page Configuration</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        target="_blank"
                        className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Globe size={14} /> Preview Live Site
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Syncing...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {activeWebinar && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-left">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Info size={20} /></div>
                    <div>
                        <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider">Active Webinar Priority</h4>
                        <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                            You have an active webinar ("{activeWebinar.title}") which is currently overriding the manual schedule settings below on the landing page.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Section */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Info size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Hero Atmosphere</h4>
                    </div>
                    <div className="space-y-6 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Hero Headline</label>
                            <textarea
                                value={data.hero.title}
                                onChange={e => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-black text-xl outline-none focus:bg-white focus:border-emerald-500/20 transition-all min-h-[120px] shadow-inner leading-tight"
                            />
                        </div>
                        <FormInput
                            label="Hero Narrative (Sub-headline)"
                            value={data.hero.subtitle}
                            onChange={(v: string) => setData({ ...data, hero: { ...data.hero, subtitle: v } })}
                        />
                    </div>
                </div>

                {/* Schedule Update */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Webinar Schedule</h4>
                    </div>
                    <div className="space-y-6 text-left">
                        <FormInput label="Display Date" value={data.schedule?.date} onChange={(v: string) => setData({ ...data, schedule: { ...data.schedule, date: v } })} />
                        <FormInput label="Display Time" value={data.schedule?.time} onChange={(v: string) => setData({ ...data, schedule: { ...data.schedule, time: v } })} />
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Note: These values are used on the landing page ONLY if no "Active" webinar is manually created in the Webinars tab.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rewards Selection */}
                <div className="md:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Gift size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Rewards</h4>
                    </div>
                    <div className="space-y-4">
                        {data.rewards.map((reward: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-black text-slate-400 border border-slate-200">{idx + 1}</span>
                                <input
                                    className="flex-1 bg-transparent outline-none font-bold text-slate-800 text-sm"
                                    value={reward.title}
                                    onChange={e => {
                                        const next = [...data.rewards];
                                        next[idx].title = e.target.value;
                                        setData({ ...data, rewards: next });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Roadmap Section */}
                <div className="md:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Map size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Growth Roadmap Sequence</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {data.roadmap.map((phase: any, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <FormInput
                                    label={`Phase ${phase.step}`}
                                    value={phase.title}
                                    onChange={(v: string) => {
                                        const next = [...data.roadmap];
                                        next[idx].title = v;
                                        setData({ ...data, roadmap: next });
                                    }}
                                />
                                <textarea
                                    value={phase.items.join('\n')}
                                    onChange={e => {
                                        const next = [...data.roadmap];
                                        next[idx].items = e.target.value.split('\n').filter(i => i.trim());
                                        setData({ ...data, roadmap: next });
                                    }}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 outline-none focus:bg-white min-h-[140px] leading-relaxed"
                                    placeholder="Bullet points..."
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CTA Settings */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Save size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Urgency & Action (CTA)</h4>
                    </div>
                    <div className="space-y-6">
                        <FormInput label="CTA Title" value={data.cta?.title} onChange={(v: string) => setData({ ...data, cta: { ...data.cta, title: v } })} />
                        <FormInput label="Button Label" value={data.cta?.button} onChange={(v: string) => setData({ ...data, cta: { ...data.cta, button: v } })} />
                    </div>
                </div>

                {/* Footer Settings */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><Globe size={20} /></div>
                        <h4 className="text-sm font-black uppercase tracking-wider">Footer</h4>
                    </div>
                    <div className="space-y-6">
                        <FormInput label="Footer Copyright Text" value={data.footer} onChange={(v: string) => setData({ ...data, footer: v })} />
                    </div>
                </div>
            </div>
        </div>
    );
}
