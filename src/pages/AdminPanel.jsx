import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminPanel({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [globalExec, setGlobalExec] = useState(0);
  const [scripts, setScripts] = useState([]);
  const [messages, setMessages] = useState([]);

  // Site Settings state
  const [settings, setSettings] = useState({
    id: 1,
    discord_show: true,
    discord_name: 'Discord',
    discord_link: '',
    devtool_show: true,
    devtool_name: '',
    devtool_link: '',
    donate_show: true,
    donate_name: '',
    donate_link: ''
  });

  // Script Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [status, setStatus] = useState('ACTIVE');
  const [executions, setExecutions] = useState(0);
  const [version, setVersion] = useState('v1.0.0');
  const [description, setDescription] = useState('');

  const ADMIN_PASS = '089527732022';

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  async function loadAdminData() {
    const { data: stats } = await supabase.from('global_stats').select('total_executions').eq('id', 1).single();
    if (stats) setGlobalExec(stats.total_executions);

    const { data: sets } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (sets) setSettings(sets);

    const { data: scriptList } = await supabase.from('scripts').select('*').order('created_at', { ascending: false });
    if (scriptList) setScripts(scriptList);

    const { data: msgList } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgList) setMessages(msgList);
  }

  const saveGlobalExec = async () => {
    await supabase.from('global_stats').upsert({ id: 1, total_executions: parseInt(globalExec) });
    alert('Global Executions berhasil disimpan!');
  };

  const saveSiteSettings = async () => {
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      discord_show: settings.discord_show,
      discord_name: settings.discord_name,
      discord_link: settings.discord_link,
      devtool_show: settings.devtool_show,
      devtool_name: settings.devtool_name,
      devtool_link: settings.devtool_link,
      donate_show: settings.donate_show,
      donate_name: settings.donate_name,
      donate_link: settings.donate_link
    });

    if (!error) {
      alert('Pengaturan tombol & link berhasil disimpan!');
      loadAdminData();
    } else {
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleSubmitScript = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      place_id: placeId,
      developer_name: developerName,
      is_verified: isVerified,
      status,
      executions: parseInt(executions),
      version,
      description
    };

    if (editingId) {
      await supabase.from('scripts').update(payload).eq('id', editingId);
    } else {
      await supabase.from('scripts').insert([payload]);
    }

    resetForm();
    loadAdminData();
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setTitle(s.title);
    setPlaceId(s.place_id);
    setDeveloperName(s.developer_name || '');
    setIsVerified(s.is_verified !== false);
    setStatus(s.status);
    setExecutions(s.executions);
    setVersion(s.version);
    setDescription(s.description);
  };

  const toggleArchive = async (s) => {
    const nextState = !s.is_archived;
    await supabase.from('scripts').update({ is_archived: nextState }).eq('id', s.id);
    loadAdminData();
  };

  const handleDeleteScript = async (id) => {
    if (confirm('Hapus script ini secara permanen?')) {
      await supabase.from('scripts').delete().eq('id', id);
      loadAdminData();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setPlaceId('');
    setDeveloperName('');
    setIsVerified(true);
    setStatus('ACTIVE');
    setExecutions(0);
    setVersion('v1.0.0');
    setDescription('');
  };

  const handleReply = async (id, replyText) => {
    await supabase.from('messages').update({ admin_reply: replyText }).eq('id', id);
    alert('Balasan tersimpan!');
    loadAdminData();
  };

  const handleDeleteMsg = async (id) => {
    if (confirm('Hapus pesan?')) {
      await supabase.from('messages').delete().eq('id', id);
      loadAdminData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
          <h2 className="font-orbitron text-xl font-bold tracking-widest text-white mb-6">ADMIN LOGIN</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan Password Admin"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono mb-4 focus:outline-none"
          />
          <button onClick={handleLogin} className="w-full py-3 bg-white text-black font-orbitron font-bold text-xs rounded-xl hover:bg-zinc-200 transition">
            MASUK PANEL
          </button>
          <button onClick={onBack} className="mt-4 text-xs font-mono text-zinc-400 hover:underline block mx-auto">
            ← Kembali ke Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white">ZHENS HUB — ADMIN PANEL</h1>
            <p className="font-mono text-xs text-zinc-400">Pengaturan Website & Dynamic Links</p>
          </div>
          <button onClick={onBack} className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono text-zinc-300 hover:bg-white hover:text-black transition">
            KELUAR
          </button>
        </div>

        {/* Global Exec */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="font-orbitron text-sm font-bold text-white mb-4">1. TOTAL EXECUTIONS GLOBAL</h2>
          <div className="flex gap-4 items-end">
            <input type="number" value={globalExec} onChange={(e) => setGlobalExec(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono" />
            <button onClick={saveGlobalExec} className="px-6 py-3 bg-white text-black font-orbitron font-bold text-xs rounded-xl">SIMPAN</button>
          </div>
        </div>

        {/* Site Settings */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-orbitron text-sm font-bold text-white mb-2">2. PENGATURAN TOMBOL & REDIRECT LINK</h2>
          
          {/* Discord */}
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white">Tombol Discord</span>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input type="checkbox" checked={settings.discord_show} onChange={(e) => setSettings({ ...settings, discord_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                Tampilkan
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={settings.discord_name} onChange={(e) => setSettings({ ...settings, discord_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
              <input type="text" value={settings.discord_link} onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })} placeholder="Link Invite Discord" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
            </div>
          </div>

          {/* Dev Tools */}
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white">Tombol Developer Tools</span>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input type="checkbox" checked={settings.devtool_show} onChange={(e) => setSettings({ ...settings, devtool_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                Tampilkan
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={settings.devtool_name} onChange={(e) => setSettings({ ...settings, devtool_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
              <input type="text" value={settings.devtool_link} onChange={(e) => setSettings({ ...settings, devtool_link: e.target.value })} placeholder="Link Redirect" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
            </div>
          </div>

          {/* Saweria */}
          <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white">Tombol Support / Donasi</span>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input type="checkbox" checked={settings.donate_show} onChange={(e) => setSettings({ ...settings, donate_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                Tampilkan
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={settings.donate_name} onChange={(e) => setSettings({ ...settings, donate_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
              <input type="text" value={settings.donate_link} onChange={(e) => setSettings({ ...settings, donate_link: e.target.value })} placeholder="Link Redirect" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
            </div>
          </div>

          <button onClick={saveSiteSettings} className="px-6 py-3 bg-emerald-500 text-black font-orbitron font-bold text-xs rounded-xl hover:bg-emerald-400 transition">SIMPAN PENGATURAN LINK</button>
        </div>

        {/* Script Form */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="font-orbitron text-sm font-bold text-white mb-4">{editingId ? 'EDIT SCRIPT' : 'TAMBAH SCRIPT'}</h2>
          <form onSubmit={handleSubmitScript} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Judul Game (misal: Evade)" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
              <input type="text" placeholder="Place ID (misal: 9872472334)" value={placeId} onChange={(e) => setPlaceId(e.target.value)} required className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
              
              {/* Status Selector Include MAINTENANCE */}
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white">
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Nama Developer/Group (opsional)" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
              <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3">
                <label className="text-xs text-zinc-300 font-mono flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  Verified Badge (Centang Biru)
                </label>
              </div>
              <input type="number" placeholder="Executions Card Ini" value={executions} onChange={(e) => setExecutions(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Versi (misal: v1.0.0)" value={version} onChange={(e) => setVersion(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
              <input type="text" placeholder="Deskripsi Ringkas Script" value={description} onChange={(e) => setDescription(e.target.value)} required className="sm:col-span-2 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-emerald-500 text-black font-orbitron font-bold text-xs rounded-xl hover:bg-emerald-400 transition">SIMPAN SCRIPT</button>
              {editingId && <button type="button" onClick={resetForm} className="px-6 py-3 bg-zinc-800 text-white font-orbitron font-bold text-xs rounded-xl">BATAL</button>}
            </div>
          </form>
        </div>

        {/* Script Table */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 overflow-x-auto">
          <h2 className="font-orbitron text-sm font-bold text-white mb-4">DAFTAR SCRIPT</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 font-mono text-xs text-zinc-400">
                <th className="py-2">Judul</th>
                <th className="py-2">Status</th>
                <th className="py-2">Archive</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="py-3 font-bold">{s.title}</td>
                  <td className="py-3 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded border ${s.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {s.is_archived ? <span className="text-amber-400">[Archived]</span> : <span className="text-zinc-500">[Public]</span>}
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button onClick={() => toggleArchive(s)} className={`px-3 py-1 font-bold text-xs rounded transition ${s.is_archived ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                      {s.is_archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={() => handleEdit(s)} className="px-3 py-1 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400">Edit</button>
                    <button onClick={() => handleDeleteScript(s.id)} className="px-3 py-1 bg-red-500 text-white font-bold text-xs rounded hover:bg-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Public Messages */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-orbitron text-sm font-bold text-white">PESAN MASUK</h2>
          {messages.map((m) => (
            <div key={m.id} className="bg-zinc-950 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span className="text-white font-bold">👤 {m.sender_name}</span>
                <button onClick={() => handleDeleteMsg(m.id)} className="text-red-400">Hapus</button>
              </div>
              <p className="text-sm text-zinc-200">{m.content}</p>
              <div className="flex gap-2">
                <input type="text" defaultValue={m.admin_reply} id={`reply-input-${m.id}`} placeholder="Balasan..." className="flex-1 bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
                <button onClick={() => handleReply(m.id, document.getElementById(`reply-input-${m.id}`).value)} className="px-4 py-2 bg-white text-black font-bold text-xs rounded">Balas</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
        }
