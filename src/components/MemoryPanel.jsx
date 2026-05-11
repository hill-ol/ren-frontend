'use client';
import { useEffect, useState } from 'react';
import { getProfile, updateProfile, sendMessage } from '../lib/api';

const SECTIONS = [
  { key: 'priorities', label: 'Priorities', icon: '🚩' },
  { key: 'preferences', label: 'Preferences', icon: '⚙️' },
  { key: 'projects',    label: 'Projects',    icon: '💻' },
  { key: 'patterns',    label: 'Patterns',    icon: '🔁' },
  { key: 'currentCourses', label: 'Current courses', icon: '📚' },
];

export default function MemoryPanel() {
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [remember,      setRemember]      = useState('');
  const [rememberSaving,setRememberSaving]= useState(false);
  const [editingItem,   setEditingItem]   = useState(null); // { section, index }
  const [editValue,     setEditValue]     = useState('');
  const [addingTo,      setAddingTo]      = useState(null);
  const [addValue,      setAddValue]      = useState('');

  useEffect(() => {
    getProfile()
      .then(data => setProfile({ ...data, currentCourses: data.currentCourses || [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (updated, summary) => {
    setSaving(true);
    try {
      await updateProfile({ ...updated, currentCourses: updated.currentCourses || [], changesSummary: summary });
      setProfile(updated);
    } catch (e) {
      alert('Save failed. Is the Ren server running?');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (section, index) => {
    const updated = { ...profile, [section]: profile[section].filter((_, i) => i !== index) };
    save(updated, `Removed item from ${section}`);
  };

  const startEdit = (section, index) => {
    setEditingItem({ section, index });
    setEditValue(profile[section][index]);
  };

  const saveEdit = () => {
    if (!editValue.trim() || !editingItem) return;
    const { section, index } = editingItem;
    const newArr = [...profile[section]];
    newArr[index] = editValue.trim();
    const updated = { ...profile, [section]: newArr };
    save(updated, `Updated item in ${section}`);
    setEditingItem(null);
    setEditValue('');
  };

  const addItem = (section) => {
    if (!addValue.trim()) return;
    const updated = { ...profile, [section]: [...profile[section], addValue.trim()] };
    save(updated, `Added item to ${section}: ${addValue.trim()}`);
    setAddingTo(null);
    setAddValue('');
  };

  const saveRemember = async () => {
    if (!remember.trim()) return;
    setRememberSaving(true);
    try {
      await sendMessage(remember.trim(), null);
      setRemember('');
      // Reload profile to see the update
      const updated = await getProfile();
      setProfile(updated);
    } catch {
      alert('Failed to send to Ren.');
    } finally {
      setRememberSaving(false);
    }
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

  const changelog = profile?.changelog || [];

  return (
    <div className="flex-1 overflow-y-auto p-5">

      {/* Tell Ren to remember */}
      <div className="bg-white border border-pk-border rounded-xl p-4 mb-4">
        <p className="text-[11px] font-medium text-pk-text3 uppercase tracking-wider mb-2">
          Tell Ren to remember
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={remember}
            onChange={e => setRemember(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveRemember()}
            placeholder="going forward, always..."
            className="flex-1 border border-pk-border2 rounded-lg px-3 py-2 text-sm bg-pk-accent text-white placeholder-white/60 outline-none focus:border-pk-accent-dk"
          />
          <button
            onClick={saveRemember}
            disabled={rememberSaving || !remember.trim()}
            className="px-4 py-2 bg-pk-accent-dk text-white rounded-lg text-xs font-medium hover:bg-pk-text disabled:opacity-40 transition-colors"
          >
            {rememberSaving ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Profile sections */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {SECTIONS.map(s => (
          <div key={s.key} className="bg-white border border-pk-border rounded-xl p-4">
            <p className="text-[11px] font-medium text-pk-text3 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>{s.icon}</span>{s.label}
            </p>
            {(profile?.[s.key] || []).map((item, i) => (
              editingItem?.section === s.key && editingItem?.index === i ? (
                <div key={i} className="flex gap-1.5 mb-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter') saveEdit(); if (e.key==='Escape') setEditingItem(null); }}
                    className="flex-1 text-xs border border-pk-accent rounded px-2 py-1 outline-none text-pk-text"
                  />
                  <button onClick={saveEdit} className="text-[10px] text-pk-accent font-medium">Save</button>
                  <button onClick={() => setEditingItem(null)} className="text-[10px] text-pk-text3">Cancel</button>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-1.5 py-1 border-b border-pk-border last:border-0 group">
                  <span className="w-1 h-1 rounded-full bg-pk-accent flex-shrink-0 mt-[5px]" />
                  <p className="text-xs text-pk-text2 flex-1 leading-relaxed">{item}</p>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0 transition-opacity">
                    <button onClick={() => startEdit(s.key, i)} className="text-[10px] text-pk-text3 hover:text-pk-accent">edit</button>
                    <button onClick={() => removeItem(s.key, i)} className="text-[10px] text-pk-text3 hover:text-red-400">remove</button>
                  </div>
                </div>
              )
            ))}
            {addingTo === s.key ? (
              <div className="flex gap-1.5 mt-2">
                <input
                  autoFocus
                  value={addValue}
                  onChange={e => setAddValue(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') addItem(s.key); if (e.key==='Escape') setAddingTo(null); }}
                  placeholder="type and press enter..."
                  className="flex-1 text-xs border border-pk-accent rounded px-2 py-1 outline-none text-pk-text"
                />
                <button onClick={() => addItem(s.key)} className="text-[10px] text-pk-accent font-medium">Add</button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingTo(s.key); setAddValue(''); }}
                className="w-full mt-2 text-xs text-pk-accent border border-dashed border-pk-border2 rounded-lg py-1 hover:bg-pk-accent-lt transition-colors"
              >
                + add
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Changelog */}
      {changelog.length > 0 && (
        <div className="bg-white border border-pk-border rounded-xl p-4">
          <p className="text-[11px] font-medium text-pk-text3 uppercase tracking-wider mb-3">
            Learning changelog
          </p>
          {changelog.slice().reverse().map((entry, i) => (
            <div key={i} className="flex gap-2.5 py-2 border-b border-pk-border last:border-0">
              <span className="text-[10px] font-medium text-pk-accent-dk bg-pk-accent-lt px-1.5 py-0.5 rounded-full h-fit mt-0.5 flex-shrink-0">
                v{entry.version}
              </span>
              <div>
                <p className="text-xs text-pk-text2 leading-relaxed">{entry.changes}</p>
                <p className="text-[10px] text-pk-text3 mt-0.5">
                  {new Date(entry.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}