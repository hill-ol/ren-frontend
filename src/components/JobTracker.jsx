'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const STATUSES = [
  { id: 'interested',   label: 'Interested',   color: '#B890A0' },
  { id: 'applied',      label: 'Applied',      color: '#4A7FB5' },
  { id: 'phone_screen', label: 'Phone screen', color: '#B57A30' },
  { id: 'interview',    label: 'Interview',    color: '#6A4AB5' },
  { id: 'offer',        label: 'Offer',        color: '#4A9B6F' },
  { id: 'rejected',     label: 'Rejected',     color: '#C47070' },
  { id: 'accepted',     label: 'Accepted',     color: '#C4607A' },
];

const statusColor = (id) => STATUSES.find(s => s.id === id)?.color || '#B890A0';

export default function JobTracker() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({ company: '', role: '', url: '', status: 'interested', deadline: '', notes: '', source: '' });

  const load = async () => {
    try {
      const res = await fetch(`${API}/jobs`);
      setJobs(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addJob = async () => {
    if (!form.company || !form.role) return;
    try {
      await fetch(`${API}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ company: '', role: '', url: '', status: 'interested', deadline: '', notes: '', source: '' });
      setAdding(false);
      load();
    } catch {}
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status } : j));
    } catch {}
  };

  const deleteJob = async (id) => {
    try {
      await fetch(`${API}/jobs/${id}`, { method: 'DELETE' });
      setJobs(prev => prev.filter(j => j._id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-pk-text3 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-pk-text">{jobs.length} applications tracked</p>
          <p className="text-xs text-pk-text3">Arc uses this to give you better career advice</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pk-accent text-white rounded-lg text-xs font-medium hover:bg-pk-accent-dk transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Add application
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white border border-pk-border rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-pk-text3 uppercase tracking-wider mb-3">New application</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              placeholder="Company"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            />
            <input
              placeholder="Role"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            />
            <input
              placeholder="URL (optional)"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            />
            <input
              type="date"
              placeholder="Deadline"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            />
            <select
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            >
              <option value="">Source</option>
              {['NUworks','LinkedIn','Wellfound','Company site','Referral','Other'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent"
            >
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full border border-pk-border2 rounded-lg px-3 py-1.5 text-sm text-pk-text outline-none focus:border-pk-accent resize-none mb-3"
          />
          <div className="flex gap-2">
            <button onClick={addJob} className="px-4 py-1.5 bg-pk-accent text-white rounded-lg text-xs font-medium hover:bg-pk-accent-dk transition-colors">
              Save
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-1.5 text-pk-text3 text-xs hover:text-pk-text">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-pk-border rounded-xl p-8 text-center">
          <p className="text-sm text-pk-text3">No applications yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <div key={job._id} className="bg-white border border-pk-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-pk-text truncate">{job.company}</p>
                  <span className="text-pk-text3 text-xs">·</span>
                  <p className="text-xs text-pk-text2 truncate">{job.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {job.source && <span className="text-[10px] text-pk-text3">{job.source}</span>}
                  {job.deadline && (
                    <span className="text-[10px] text-pk-text3">
                      Due {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {job.notes && <span className="text-[10px] text-pk-text3 truncate max-w-[200px]">{job.notes}</span>}
                </div>
              </div>
              <select
                value={job.status}
                onChange={e => updateStatus(job._id, e.target.value)}
                className="text-xs rounded-full px-2.5 py-1 border outline-none cursor-pointer font-medium"
                style={{ color: statusColor(job.status), borderColor: statusColor(job.status), background: 'transparent' }}
              >
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button
                onClick={() => deleteJob(job._id)}
                className="text-pk-text3 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}