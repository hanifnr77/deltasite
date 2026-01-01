import React, { useState, useRef } from 'react';
import { Block, LinkBlock, TextBlock, DividerBlock, ImageGridBlock, ImageGridItem, UserProfile, SocialLinkItem, SocialPlatform, YoutubeBlock, MapBlock } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { uploadImage, saveSetting } from '../../services/storageService'; 
import { IconMapper } from '../ui/IconMapper';
import { PublicView } from '../public/PublicView';
import { useToast } from '../ui/Toast'; 
import { Modal } from '../ui/Modal'; 
import { 
  Trash2, Plus, Save, Eye, EyeOff, 
  LayoutDashboard, Image as ImageIcon, Upload, LogOut,
  Type, Minus, Link as LinkIcon, Grid as GridIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, List, ListOrdered,
  ArrowUp, ArrowDown, Menu, X, Share2, Settings, User, Lock, AlertTriangle, CheckCircle, ExternalLink, Loader2, GripVertical, ArrowDownToLine, ArrowUpToLine,
  Youtube, MapPin, PanelLeft, Users, GraduationCap, School,
  MousePointerClick, TrendingUp, Info, AlertOctagon, Megaphone, Filter
} from 'lucide-react';

interface AdminViewProps {
  blocks: Block[];
  profile: UserProfile;
  socials: SocialLinkItem[];
  onUpdateBlocks: (blocks: Block[]) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSocials: (socials: SocialLinkItem[]) => void;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  blocks, profile, socials, 
  onUpdateBlocks, onUpdateProfile, onUpdateSocials, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blocks' | 'socials' | 'profile'>('dashboard');
  
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  // Focus Mode State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  
  // Smart Insert State
  const [insertMode, setInsertMode] = useState<'top' | 'bottom'>('bottom');

  // Stats Limit State (Fitur Baru)
  const [statsLimit, setStatsLimit] = useState<number | 'all'>(10);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Toast & Modal Hook
  const { addToast } = useToast();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; type: 'block' | 'social' }>({
    isOpen: false, id: null, type: 'block'
  });

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false); 

  // --- Dashboard Calculations ---
  const linkBlocks = blocks.filter(b => b.type === 'link') as LinkBlock[];
  const totalLinks = linkBlocks.length;
  const activeLinks = linkBlocks.filter(b => b.active).length;
  const totalClicks = linkBlocks.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  // Logika Sortir & Limit (Fitur Baru)
  const sortedLinks = [...linkBlocks].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const displayedLinks = statsLimit === 'all' ? sortedLinks : sortedLinks.slice(0, statsLimit);

  // --- Generic Block Logic ---
  const addBlock = (type: 'link' | 'text' | 'divider' | 'image_grid' | 'social_embed' | 'youtube' | 'map', indexToInsert?: number) => {
    let newBlock: Block;
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const defaultAudience = 'all';

    if (type === 'link') {
      newBlock = {
        id, type: 'link', audience: defaultAudience, 
        title: 'Tombol Baru', subtitle: '', url: 'https://', active: true,
        clicks: 0, category: 'Umum', displayMode: 'solid'
      } as LinkBlock;
    } else if (type === 'text') {
      newBlock = {
        id, type: 'text', audience: defaultAudience,
        content: 'Tulis teks disini...', align: 'center',
        format: { bold: false, italic: false, underline: false }, listType: 'none',
        fontSize: 'base', fontFamily: 'sans', textColor: ''
      } as TextBlock;
    } else if (type === 'image_grid') {
      newBlock = {
        id, type: 'image_grid', audience: defaultAudience,
        columns: 2, aspectRatio: 'square', gap: 'md', items: [
          { id: `img_${Date.now()}`, url: 'https://placehold.co/400x400/png' },
          { id: `img_${Date.now()+1}`, url: 'https://placehold.co/400x400/059669/white.png' }
        ]
      } as ImageGridBlock;
    } else if (type === 'social_embed') {
      newBlock = {
        id, type: 'social_embed', audience: defaultAudience
      };
    } else if (type === 'youtube') {
      newBlock = {
        id, type: 'youtube', audience: defaultAudience, url: '', title: ''
      } as YoutubeBlock;
    } else if (type === 'map') {
      newBlock = {
        id, type: 'map', audience: defaultAudience, embedUrl: '', title: ''
      } as MapBlock;
    } else {
       newBlock = {
        id, type: 'divider', audience: defaultAudience, height: 'md', showLine: true, lineStyle: 'solid'
       } as DividerBlock;
    }

    let updatedBlocks = [...blocks];
    
    if (typeof indexToInsert === 'number') {
        updatedBlocks.splice(indexToInsert + 1, 0, newBlock); 
    } else {
        if (insertMode === 'top') {
            updatedBlocks.unshift(newBlock);
        } else {
            updatedBlocks.push(newBlock);
        }
    }
    
    onUpdateBlocks(updatedBlocks);
    addToast('Blok baru berhasil ditambahkan', 'success');
  };

  const updateBlock = (id: string, updates: any) => {
    onUpdateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const confirmDeleteBlock = (id: string) => {
    setDeleteModal({ isOpen: true, id, type: 'block' });
  };

  const confirmDeleteSocial = (id: string) => {
    setDeleteModal({ isOpen: true, id, type: 'social' });
  };

  const executeDelete = () => {
    if (deleteModal.type === 'block' && deleteModal.id) {
      onUpdateBlocks(blocks.filter(b => b.id !== deleteModal.id));
      addToast('Konten berhasil dihapus', 'success');
    } else if (deleteModal.type === 'social' && deleteModal.id) {
      onUpdateSocials(socials.filter(s => s.id !== deleteModal.id));
      addToast('Media sosial berhasil dihapus', 'success');
    }
    setDeleteModal({ isOpen: false, id: null, type: 'block' });
  };

  const handleMapUrlChange = (id: string, value: string) => {
    let cleanUrl = value;
    if (value.includes('<iframe')) {
      const srcMatch = value.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        cleanUrl = srcMatch[1];
        addToast('URL Embed berhasil diekstrak dari kode iframe', 'success');
      }
    }
    updateBlock(id, { embedUrl: cleanUrl });
  }

  const handleYoutubeUrlChange = (id: string, value: string) => {
    updateBlock(id, { url: value });
  }

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [draggedItem] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedItem);
    
    onUpdateBlocks(newBlocks);
    setDraggedIndex(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      onUpdateBlocks(newBlocks);
    }
  };

  // --- Specific Block Handlers ---
  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        addToast('Ukuran gambar maksimal 5MB.', 'error');
        return;
      }
      
      setUploadingId(id);
      try {
        const imageUrl = await uploadImage(file);
        updateBlock(id, { image: imageUrl, displayMode: 'image' });
        addToast('Gambar berhasil diupload', 'success');
      } catch (error) {
        addToast("Gagal mengupload gambar. Coba lagi.", 'error');
        console.error(error);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const handleGridImageUpload = async (blockId: string, itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 3 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        addToast('Ukuran gambar maksimal 3MB.', 'error');
        return;
      }

      const uploadKey = `${blockId}_${itemIndex}`;
      setUploadingId(uploadKey);

      try {
        const imageUrl = await uploadImage(file);
        const block = blocks.find(b => b.id === blockId) as ImageGridBlock;
        if (!block) return;
        const newItems = [...block.items];
        newItems[itemIndex] = { ...newItems[itemIndex], url: imageUrl };
        updateBlock(blockId, { items: newItems });
        addToast('Gambar grid berhasil diupload', 'success');
      } catch (error) {
        addToast("Gagal mengupload gambar grid.", 'error');
        console.error(error);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const handleAddGridImage = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId) as ImageGridBlock;
    if (!block) return;
    const newItem: ImageGridItem = {
      id: `img_${Date.now()}`,
      url: 'https://placehold.co/400x400/e2e8f0/gray.png?text=New+Image'
    };
    updateBlock(blockId, { items: [...block.items, newItem] });
  };

  const handleRemoveGridImage = (blockId: string, itemIndex: number) => {
    const block = blocks.find(b => b.id === blockId) as ImageGridBlock;
    if (!block) return;
    const newItems = block.items.filter((_, idx) => idx !== itemIndex);
    updateBlock(blockId, { items: newItems });
  };

  const handleUpdateGridItem = (blockId: string, itemIndex: number, updates: Partial<ImageGridItem>) => {
    const block = blocks.find(b => b.id === blockId) as ImageGridBlock;
    if (!block) return;
    const newItems = [...block.items];
    newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
    updateBlock(blockId, { items: newItems });
  };

  // --- Social Logic ---
  const addSocial = (platform: SocialPlatform) => {
    const newSocial: SocialLinkItem = {
      id: `soc_${Date.now()}`, platform, url: '', active: true
    };
    onUpdateSocials([...socials, newSocial]);
    addToast(`Platform ${platform} ditambahkan`, 'info');
  };
  
  const updateSocial = (id: string, updates: Partial<SocialLinkItem>) => {
    onUpdateSocials(socials.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // --- Password Logic ---
  const handleUpdatePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await saveSetting('admin_password', newPassword);
      
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password admin berhasil diperbarui ke Sistem Aman!', 'success');
    } catch (err) {
      console.error("Gagal simpan password:", err);
      addToast('Gagal menyimpan password. Periksa koneksi internet.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveProfile = () => {
    addToast('Profil & Pengaturan tersimpan!', 'success');
  }

  const socialPlatforms: SocialPlatform[] = ['website', 'whatsapp', 'youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin', 'threads'];

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 
        ${activeTab === id 
          ? 'bg-[#00B7B5] text-[#005461] shadow-md border border-[#00B7B5]'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden relative">
      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Ya, Hapus"
      />

      {/* MOBILE MENU HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#005461] to-[#018790] border-b border-white/10 z-40 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm">M8</div>
           <span className="font-heading font-bold">Admin Panel</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/80 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-30 h-full flex flex-col shrink-0
        bg-gradient-to-b from-[#005461] via-[#018790] to-[#005461]
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${showSidebar ? 'md:w-64' : 'md:w-0 overflow-hidden'}
      `}>
        <div className="w-64 flex flex-col h-full">
           <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-lg backdrop-blur-sm">
                 <LayoutDashboard size={20} />
              </div>
              <div>
                 <h1 className="font-heading font-bold text-white text-lg leading-tight">Admin</h1>
                 <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">MTsN 8 Tulungagung</p>
              </div>
           </div>

           <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold text-white/50 uppercase px-2 mb-2">Menu Utama</div>
              <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <SidebarItem id="blocks" label="Konten & Link" icon={LinkIcon} />
              <SidebarItem id="socials" label="Media Sosial" icon={Share2} />
              <SidebarItem id="profile" label="Profil & Pengaturan" icon={Settings} />
           </div>

           <div className="p-4 border-t border-white/10 bg-black/10">
              <div className="flex items-center gap-3 mb-4 px-2">
                 <img src={profile.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full bg-white border border-gray-200 object-cover" />
                 <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                    <p className="text-xs text-white/60 truncate">Administrator</p>
                 </div>
              </div>
              <button 
                 onClick={onLogout} 
                 className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all shadow-sm"
              >
                 <LogOut size={16} /> Keluar
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
         <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scrollbar-thin scrollbar-thumb-gray-300 pt-20 md:pt-8">
               <div className="max-w-5xl mx-auto animate-fade-in">
                  
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                       <div>
                          <h2 className="text-2xl font-heading font-bold text-gray-800">Dashboard</h2>
                          <p className="text-gray-500 text-sm">Ringkasan statistik dan performa microsite.</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><LinkIcon size={24} /></div>
                             <div>
                                <h3 className="text-3xl font-bold text-gray-800">{totalLinks}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tombol</p>
                             </div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CheckCircle size={24} /></div>
                             <div>
                                <h3 className="text-3xl font-bold text-gray-800">{activeLinks}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tombol Aktif</p>
                             </div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                             <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><MousePointerClick size={24} /></div>
                             <div>
                                <h3 className="text-3xl font-bold text-gray-800">{totalClicks.toLocaleString()}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Klik</p>
                             </div>
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                             <div className="flex items-center gap-2">
                                <TrendingUp size={20} className="text-emerald-500" />
                                <h3 className="font-heading font-bold text-lg text-gray-800">Top Performa Link</h3>
                             </div>
                             
                             {/* DROPDOWN FILTER LIMIT */}
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase hidden sm:inline">Tampilkan:</span>
                                <select 
                                  value={statsLimit} 
                                  onChange={(e) => setStatsLimit(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                  className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none text-gray-700"
                                >
                                  <option value={5}>5 Besar</option>
                                  <option value={10}>10 Besar</option>
                                  <option value={25}>25 Besar</option>
                                  <option value={50}>50 Besar</option>
                                  <option value={100}>100 Besar</option>
                                  <option value="all">Semua</option>
                                </select>
                             </div>
                          </div>
                          
                          {displayedLinks.length > 0 ? (
                            <div className="space-y-4">
                                {displayedLinks.map((link, idx) => (
                                  <div key={link.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                      <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                                          #{idx + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="font-bold text-gray-800 truncate">{link.title}</p>
                                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                                      </div>
                                      <div className="text-right">
                                         <span className="block font-bold text-emerald-600">{link.clicks.toLocaleString()}</span>
                                         <span className="text-[10px] text-gray-400">klik</span>
                                      </div>
                                  </div>
                                ))}
                                {statsLimit !== 'all' && displayedLinks.length < totalLinks && (
                                   <div className="text-center pt-2">
                                     <button onClick={() => setStatsLimit('all')} className="text-xs font-bold text-emerald-600 hover:underline">Lihat Semua Link</button>
                                   </div>
                                )}
                            </div>
                          ) : (
                            <p className="text-center text-gray-400 py-8 text-sm">Belum ada data statistik link.</p>
                          )}
                       </div>
                    </div>
                  )}
                  
                  {activeTab === 'blocks' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-heading font-bold text-gray-800">Manajemen Konten</h2>
                          <p className="text-gray-500 text-sm">Atur susunan tombol, teks, dan galeri.</p>
                        </div>
                      </div>

                      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200 -mx-4 px-4 md:-mx-8 md:px-8 mb-6 shadow-sm transition-all duration-300">
                         <div className="max-w-5xl mx-auto space-y-4">
                           
                           {/* Toolbar: Toggles & Insert Position */}
                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                 {/* Sidebar Toggle */}
                                 <button 
                                   onClick={() => setShowSidebar(!showSidebar)}
                                   className={`p-2 rounded-lg transition-colors ${!showSidebar ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'}`}
                                   title="Toggle Sidebar"
                                 >
                                   <PanelLeft size={20} />
                                 </button>

                                 <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                                 {/* Insert Position Radios */}
                                 <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                   <span className="hidden sm:inline">Posisi Tambah:</span>
                                   <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#059669] transition-colors">
                                      <input type="radio" checked={insertMode === 'top'} onChange={() => setInsertMode('top')} className="text-[#059669] focus:ring-[#059669]" />
                                      <ArrowUpToLine size={14} /> <span className="hidden sm:inline">Atas</span>
                                   </label>
                                   <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#059669] transition-colors">
                                      <input type="radio" checked={insertMode === 'bottom'} onChange={() => setInsertMode('bottom')} className="text-[#059669] focus:ring-[#059669]" />
                                      <ArrowDownToLine size={14} /> <span className="hidden sm:inline">Bawah</span>
                                   </label>
                                 </div>
                               </div>

                               {/* Preview Toggle (Desktop Only) */}
                               <div className="hidden xl:block">
                                  <button 
                                     onClick={() => setShowPreview(!showPreview)}
                                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!showPreview ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-100'}`}
                                     title={showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
                                   >
                                      {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                      <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                                   </button>
                               </div>
                           </div>

                           {/* Block Type Buttons */}
                           <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                               <Button onClick={() => addBlock('link')} size="sm" className="bg-[#059669] hover:bg-[#047857] text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><LinkIcon size={16} /> Link</Button>
                               <Button onClick={() => addBlock('image_grid')} size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><GridIcon size={16} /> Galeri</Button>
                               <Button onClick={() => addBlock('text')} size="sm" className="bg-[#0f766e] hover:bg-[#115e59] text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><Type size={16} /> Teks</Button>
                               <Button onClick={() => addBlock('divider')} size="sm" className="bg-[#115e59] hover:bg-[#134e4a] text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><Minus size={16} /> Garis</Button>
                               <Button onClick={() => addBlock('social_embed')} size="sm" className="bg-[#005461] hover:bg-[#003d47] text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><Share2 size={16} /> Posisi Medsos</Button>
                               <Button onClick={() => addBlock('youtube')} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><Youtube size={16} /> YouTube</Button>
                               <Button onClick={() => addBlock('map')} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none shadow-md transition-transform active:scale-95 opacity-100"><MapPin size={16} /> Peta</Button>
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                        {blocks.map((block, index) => (
                          <div 
                            key={block.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`
                              bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative
                              ${draggedIndex === index ? 'opacity-40 border-dashed border-emerald-500' : ''}
                            `}
                          >
                            <div className="absolute top-3 left-3 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1">
                               <GripVertical size={20} />
                            </div>

                            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                              <div className="flex bg-gray-100 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                  <button onClick={() => moveBlock(index, 'up')} disabled={index===0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowUp size={14}/></button>
                                  <button onClick={() => moveBlock(index, 'down')} disabled={index===blocks.length-1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowDown size={14}/></button>
                              </div>
                              <div className="group/add relative mr-2">
                                  <button className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Sisipkan Konten Dibawah Ini">
                                      <Plus size={14} />
                                  </button>
                                  {/* Dropdown Mini saat Hover */}
                                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 p-1 hidden group-hover/add:block z-50">
                                      <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">Sisipkan:</div>
                                      <button onClick={() => addBlock('link', index)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-emerald-50 rounded flex items-center gap-2"><LinkIcon size={12}/> Link</button>
                                      <button onClick={() => addBlock('text', index)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-emerald-50 rounded flex items-center gap-2"><Type size={12}/> Teks</button>
                                      <button onClick={() => addBlock('divider', index)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-emerald-50 rounded flex items-center gap-2"><Minus size={12}/> Garis</button>
                                      <button onClick={() => addBlock('image_grid', index)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-emerald-50 rounded flex items-center gap-2"><GridIcon size={12}/> Galeri</button>
                                  </div>
                              </div>

                              {/* AUDIENCE BADGES IN HEADER */}
                              {block.audience === 'teacher' && <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border mr-2 bg-yellow-50 text-yellow-600 border-yellow-100 flex items-center gap-1"><School size={10} /> Guru</span>}
                              {block.audience === 'student' && <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border mr-2 bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1"><GraduationCap size={10} /> Siswa</span>}
                              {block.audience === 'all' && <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border mr-2 bg-gray-50 text-gray-600 border-gray-100 flex items-center gap-1"><Users size={10} /> Semua</span>}
                              
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border mr-2 select-none ${
                                  block.type === 'link' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                  block.type === 'text' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                  block.type === 'image_grid' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  block.type === 'social_embed' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                  block.type === 'youtube' ? 'bg-red-50 text-red-600 border-red-100' :
                                  block.type === 'map' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  'bg-gray-50 text-gray-600 border-gray-100'
                              }`}>{block.type === 'image_grid' ? 'Galeri' : block.type === 'social_embed' ? 'Posisi Medsos' : block.type === 'youtube' ? 'YouTube' : block.type === 'map' ? 'Peta Google' : block.type}</span>
                              <button onClick={() => confirmDeleteBlock(block.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </div>

                            <div className="pl-6 pt-8">
                               {/* AUDIENCE SELECTOR - GLOBAL FOR ALL BLOCKS */}
                               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Users size={12} /> Target Audience:</span>
                                   <div className="flex flex-wrap items-center gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                            <input type="radio" checked={block.audience === 'all' || !block.audience} onChange={() => updateBlock(block.id, { audience: 'all' })} className="w-4 h-4 text-emerald-600 focus:ring-emerald-600 border-gray-300" />
                                            <span className={`text-xs font-bold ${block.audience === 'all' || !block.audience ? 'text-gray-900' : 'text-gray-500'}`}>Semua</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                            <input type="radio" checked={block.audience === 'teacher'} onChange={() => updateBlock(block.id, { audience: 'teacher' })} className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" />
                                            <span className={`text-xs font-bold ${block.audience === 'teacher' ? 'text-yellow-700' : 'text-gray-500'}`}>Guru</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                                            <input type="radio" checked={block.audience === 'student'} onChange={() => updateBlock(block.id, { audience: 'student' })} className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300" />
                                            <span className={`text-xs font-bold ${block.audience === 'student' ? 'text-blue-700' : 'text-gray-500'}`}>Siswa</span>
                                        </label>
                                   </div>
                               </div>

                            {block.type === 'link' && (
                              <div className="flex flex-col sm:flex-row gap-4 pr-10 md:pr-16">
                                <div className="w-full sm:w-20 h-20 rounded-lg bg-gray-100 shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center relative group/img">
                                    {(block as LinkBlock).displayMode === 'image' && (block as LinkBlock).image ? (
                                        <img src={(block as LinkBlock).image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <LinkIcon size={24} className="text-gray-400" />
                                    )}
                                    {uploadingId === block.id && (
                                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                                         <Loader2 size={24} className="text-white animate-spin" />
                                         <span className="text-[10px] text-white mt-1">Upload...</span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-white text-[10px]" onClick={() => fileInputRefs.current[block.id]?.click()}>
                                        <ImageIcon size={16} className="mb-1"/> Ganti
                                    </div>
                                    <input type="file" ref={el => { fileInputRefs.current[block.id] = el }} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(block.id, e)} />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <Input 
                                        value={(block as LinkBlock).title} 
                                        onChange={(e) => updateBlock(block.id, { title: e.target.value })} 
                                        placeholder="Judul Tombol"
                                        className="font-bold text-lg"
                                    />
                                    <Input 
                                        value={(block as LinkBlock).subtitle || ''} 
                                        onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })} 
                                        placeholder="Subjudul (Opsional)"
                                        className="text-sm font-normal text-gray-600"
                                    />
                                    <Input 
                                        value={(block as LinkBlock).url} 
                                        onChange={(e) => updateBlock(block.id, { url: e.target.value })} 
                                        placeholder="https://..."
                                        className="text-sm font-mono text-gray-500"
                                    />
                                    <div className="flex flex-wrap gap-4 items-center pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${block.active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${block.active ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">Aktif</span>
                                            <input type="checkbox" checked={(block as LinkBlock).active} onChange={(e) => updateBlock(block.id, { active: e.target.checked })} className="hidden" />
                                        </label>
                                        <div className="h-4 w-px bg-gray-200"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden relative shadow-sm">
                                                <input 
                                                  type="color" 
                                                  value={(block as LinkBlock).customColor || '#059669'} 
                                                  onChange={(e) => updateBlock(block.id, { 
                                                    customColor: e.target.value, 
                                                    displayMode: (block as LinkBlock).displayMode === 'image' ? 'image' : 'solid' 
                                                  })} 
                                                  className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" 
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">Warna</span>
                                        </div>
                                    </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'text' && (
                              <div className="pr-10 md:pr-16">
                                <textarea 
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm min-h-[80px]"
                                    value={(block as TextBlock).content}
                                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                    placeholder="Tulis paragraf atau judul..."
                                />
                                <div className="flex flex-wrap gap-2 mt-3 items-center">
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                        {['left', 'center', 'right', 'justify'].map((align) => (
                                            <button key={align} onClick={() => updateBlock(block.id, { align })} className={`p-1.5 rounded hover:bg-white ${ (block as TextBlock).align === align ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                                                {align === 'left' && <AlignLeft size={14}/>} 
                                                {align === 'center' && <AlignCenter size={14}/>} 
                                                {align === 'right' && <AlignRight size={14}/>}
                                                {align === 'justify' && <AlignJustify size={14}/>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                        <button onClick={() => updateBlock(block.id, { format: { ...(block as TextBlock).format, bold: !(block as TextBlock).format.bold } })} className={`p-1.5 rounded hover:bg-white ${(block as TextBlock).format.bold ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Bold size={14}/></button>
                                        <button onClick={() => updateBlock(block.id, { format: { ...(block as TextBlock).format, italic: !(block as TextBlock).format.italic } })} className={`p-1.5 rounded hover:bg-white ${(block as TextBlock).format.italic ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Italic size={14}/></button>
                                        <button onClick={() => updateBlock(block.id, { format: { ...(block as TextBlock).format, underline: !(block as TextBlock).format.underline } })} className={`p-1.5 rounded hover:bg-white ${(block as TextBlock).format.underline ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Underline size={14}/></button>
                                    </div>
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                        <button onClick={() => updateBlock(block.id, { listType: 'none' })} className={`px-2 py-1.5 text-xs rounded hover:bg-white ${(block as TextBlock).listType === 'none' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>Teks</button>
                                        <button onClick={() => updateBlock(block.id, { listType: 'bullet' })} className={`p-1.5 rounded hover:bg-white ${(block as TextBlock).listType === 'bullet' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><List size={14}/></button>
                                        <button onClick={() => updateBlock(block.id, { listType: 'number' })} className={`p-1.5 rounded hover:bg-white ${(block as TextBlock).listType === 'number' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><ListOrdered size={14}/></button>
                                    </div>
                                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                                    <select 
                                      value={(block as TextBlock).fontSize || 'base'} 
                                      onChange={(e) => updateBlock(block.id, { fontSize: e.target.value })}
                                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:border-blue-500 outline-none"
                                    >
                                      <option value="sm">Kecil</option><option value="base">Normal</option><option value="lg">Besar</option><option value="xl">X-Besar</option>
                                    </select>
                                    <select 
                                      value={(block as TextBlock).fontFamily || 'sans'} 
                                      onChange={(e) => updateBlock(block.id, { fontFamily: e.target.value })}
                                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:border-blue-500 outline-none"
                                    >
                                      <option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Mono</option>
                                    </select>
                                    <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm cursor-pointer ml-1">
                                        <input type="color" value={(block as TextBlock).textColor || '#374151'} onChange={(e) => updateBlock(block.id, { textColor: e.target.value })} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" title="Warna Teks" />
                                    </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'image_grid' && (
                              <div className="pr-10 md:pr-16 space-y-4">
                                <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                   <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-gray-500 uppercase">Kolom</label>
                                      <div className="flex bg-white rounded border border-gray-200">
                                       {[1,2,3,4].map(col => (
                                          <button key={col} onClick={() => updateBlock(block.id, { columns: col })} className={`w-8 h-8 text-xs font-bold ${ (block as ImageGridBlock).columns === col ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>{col}x</button>
                                       ))}
                                      </div>
                                   </div>
                                   <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-gray-500 uppercase">Rasio</label>
                                      <select value={(block as ImageGridBlock).aspectRatio} onChange={(e) => updateBlock(block.id, { aspectRatio: e.target.value })} className="h-8 text-xs border border-gray-200 rounded px-2">
                                        <option value="square">Persegi (1:1)</option><option value="video">Video (16:9)</option><option value="portrait">Portrait (3:4)</option><option value="auto">Auto</option>
                                      </select>
                                   </div>
                                   <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-gray-500 uppercase">Jarak</label>
                                      <select value={(block as ImageGridBlock).gap} onChange={(e) => updateBlock(block.id, { gap: e.target.value })} className="h-8 text-xs border border-gray-200 rounded px-2">
                                        <option value="none">Rapat</option><option value="sm">Kecil</option><option value="md">Sedang</option>
                                      </select>
                                   </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {(block as ImageGridBlock).items.map((item, i) => (
                                    <div key={item.id} className="relative border border-gray-200 rounded-lg p-2 bg-white flex gap-3 group/item">
                                        <div className="w-16 h-16 bg-gray-100 rounded shrink-0 overflow-hidden relative cursor-pointer" onClick={() => fileInputRefs.current[item.id]?.click()}>
                                            <img src={item.url} className="w-full h-full object-cover" />
                                            {uploadingId === `${block.id}_${i}` && (
                                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20"><Loader2 size={16} className="text-white animate-spin" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"><Upload size={16} className="text-white"/></div>
                                            <input type="file" ref={el => { fileInputRefs.current[item.id] = el }} className="hidden" accept="image/*" onChange={(e) => handleGridImageUpload(block.id, i, e)} />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                           <Input value={item.caption || ''} onChange={(e) => handleUpdateGridItem(block.id, i, { caption: e.target.value })} placeholder="Caption (opsional)" className="text-xs py-1" />
                                           <div className="flex items-center gap-1">
                                              <LinkIcon size={12} className="text-gray-400"/>
                                              <input value={item.linkUrl || ''} onChange={(e) => handleUpdateGridItem(block.id, i, { linkUrl: e.target.value })} placeholder="https://... (Link saat klik)" className="w-full text-xs border-b border-gray-200 focus:border-emerald-500 outline-none text-gray-500" />
                                           </div>
                                        </div>
                                        <button onClick={() => handleRemoveGridImage(block.id, i)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-500 shadow border border-gray-200 opacity-0 group-hover/item:opacity-100 transition-opacity"><X size={12} /></button>
                                    </div>
                                  ))}
                                  <button onClick={() => handleAddGridImage(block.id)} className="border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-24 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-xs font-medium"><Plus size={20} className="mb-1"/> Tambah Gambar</button>
                                </div>
                              </div>
                            )}

                            {block.type === 'youtube' && (
                              <div className="pr-10 md:pr-16 space-y-3">
                                <Input 
                                  value={(block as YoutubeBlock).url} 
                                  onChange={(e) => handleYoutubeUrlChange(block.id, e.target.value)} 
                                  placeholder="Link Video Spesifik (cth: https://youtu.be/...)"
                                  label="Link YouTube (Bukan Link Pencarian)"
                                  className="text-sm font-mono text-gray-500"
                                />
                                <Input 
                                  value={(block as YoutubeBlock).title || ''} 
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })} 
                                  placeholder="Judul Video (Opsional)"
                                />
                              </div>
                            )}

                            {block.type === 'map' && (
                              <div className="pr-10 md:pr-16 space-y-3">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                                   <p className="font-bold mb-1">Cara mengambil Embed Map:</p>
                                   <ol className="list-decimal list-inside space-y-1">
                                     <li>Buka Google Maps, cari lokasi.</li>
                                     <li>Klik tombol "Bagikan" / "Share".</li>
                                     <li>Pilih tab "Sematkan Peta" / "Embed a map".</li>
                                     <li>Salin HTML-nya dan paste di bawah ini.</li>
                                   </ol>
                                </div>
                                <textarea
                                  value={(block as MapBlock).embedUrl}
                                  onChange={(e) => handleMapUrlChange(block.id, e.target.value)}
                                  placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-mono text-gray-500 min-h-[80px]"
                                />
                                <Input 
                                  value={(block as MapBlock).title || ''} 
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })} 
                                  placeholder="Judul Lokasi (Opsional)"
                                />
                              </div>
                            )}

                            {block.type === 'divider' && (
                              <div className="pr-10 md:pr-16 flex flex-wrap items-center gap-6 py-2">
                                <div className="flex flex-col gap-1">
                                      <label className="text-[10px] uppercase font-bold text-gray-500">Tinggi</label>
                                      <select value={(block as DividerBlock).height} onChange={(e) => updateBlock(block.id, { height: e.target.value })} className="text-sm border border-gray-200 rounded p-1.5 bg-gray-50">
                                          <option value="xs">Kecil</option><option value="sm">Sedang</option><option value="md">Normal</option><option value="lg">Besar</option><option value="xl">Sangat Besar</option>
                                      </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                      <label className="text-[10px] uppercase font-bold text-gray-500">Gaya Garis</label>
                                      <select value={(block as DividerBlock).lineStyle || 'solid'} onChange={(e) => updateBlock(block.id, { lineStyle: e.target.value })} className="text-sm border border-gray-200 rounded p-1.5 bg-gray-50">
                                          <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="double">Double</option><option value="wavy">Wavy</option>
                                      </select>
                                </div>
                                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                                <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
                                    <input type="checkbox" checked={(block as DividerBlock).showLine} onChange={(e) => updateBlock(block.id, { showLine: e.target.checked })} className="rounded text-emerald-600" />
                                    <span className="text-sm font-medium text-gray-600">Tampilkan Garis</span>
                                </label>
                              </div>
                            )}

                            {block.type === 'social_embed' && (
                              <div className="pr-10 md:pr-16 py-4 flex items-center justify-center border-2 border-dashed border-orange-200 rounded-lg bg-orange-50/50">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-orange-700">Posisi Ikon Media Sosial</p>
                                    <p className="text-xs text-orange-600/70 mt-1">Ikon medsos yang aktif akan muncul di urutan ini.</p>
                                    <button onClick={() => setActiveTab('socials')} className="mt-3 text-xs text-orange-600 underline hover:text-orange-800">Edit URL Medsos di sini</button>
                                </div>
                              </div>
                            )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'socials' && (
                    <div className="space-y-6">
                        <div><h2 className="text-2xl font-heading font-bold text-gray-800">Media Sosial</h2><p className="text-gray-500 text-sm">Tautkan akun media sosial resmi madrasah.</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tambah Platform</h4>
                            <div className="flex flex-wrap gap-2">
                              {socialPlatforms.map(p => (
                                  <button key={p} onClick={() => addSocial(p)} className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-lg transition-all text-sm font-medium"><IconMapper platform={p} size={16} /> <span className="capitalize">{p}</span></button>
                              ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {socials.map((social) => (
                              <div key={social.id} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm group">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 shrink-0"><IconMapper platform={social.platform} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{social.platform}</p>
                                    <input type="text" placeholder="Paste URL disini..." value={social.url} onChange={(e) => updateSocial(social.id, { url: e.target.value })} className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none pb-1 text-gray-800 placeholder-gray-300" />
                                </div>
                                <button onClick={() => confirmDeleteSocial(social.id)} className="text-gray-300 hover:text-red-500 p-2 opacity-50 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                              </div>
                          ))}
                        </div>
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <div className="space-y-6 max-w-2xl">
                        <div><h2 className="text-2xl font-heading font-bold text-gray-800">Profil & Pengaturan</h2><p className="text-gray-500 text-sm">Identitas utama microsite dan keamanan.</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2">Identitas Visual</h3>
                              <div className="flex items-start gap-6">
                                <div className="shrink-0 flex flex-col items-center gap-2">
                                    <img src={profile.avatarUrl} className="w-24 h-24 rounded-full bg-gray-50 object-cover border-4 border-white shadow-md" alt="Avatar"/>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <Input label="URL Logo" value={profile.avatarUrl} onChange={(e) => onUpdateProfile({...profile, avatarUrl: e.target.value})} placeholder="https://..." />
                                    <Input label="Nama Microsite" value={profile.name} onChange={(e) => onUpdateProfile({...profile, name: e.target.value})} />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold font-heading">Bio / Deskripsi</label>
                                <textarea className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:border-emerald-500 outline-none shadow-sm min-h-[100px] text-sm" value={profile.bio} onChange={(e) => onUpdateProfile({...profile, bio: e.target.value})} />
                              </div>
                          </div>

                          {/* --- RUNNING TEXT EDITOR --- */}
                          <div className="space-y-4 pt-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2 flex items-center gap-2"><Megaphone size={16}/> Running Text / Info Bar</h3>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-gray-700">Tampilkan Running Text</span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={profile.runningTextActive || false} onChange={(e) => onUpdateProfile({...profile, runningTextActive: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                      </label>
                                  </div>
                                  
                                  <textarea 
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:border-emerald-500 outline-none shadow-sm min-h-[80px] text-sm" 
                                    value={profile.runningText || ''} 
                                    onChange={(e) => onUpdateProfile({...profile, runningText: e.target.value})}
                                    placeholder="Tulis informasi penting disini..."
                                  />
                                  
                                  <div className="flex flex-wrap gap-4">
                                     <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="runningType" checked={profile.runningTextType === 'info' || !profile.runningTextType} onChange={() => onUpdateProfile({...profile, runningTextType: 'info'})} className="text-blue-500 focus:ring-blue-500" />
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><Info size={12}/> Info (Biru)</span>
                                     </label>
                                     <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="runningType" checked={profile.runningTextType === 'warning'} onChange={() => onUpdateProfile({...profile, runningTextType: 'warning'})} className="text-yellow-500 focus:ring-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={12}/> Peringatan (Kuning)</span>
                                     </label>
                                     <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="runningType" checked={profile.runningTextType === 'danger'} onChange={() => onUpdateProfile({...profile, runningTextType: 'danger'})} className="text-red-500 focus:ring-red-500" />
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1"><AlertOctagon size={12}/> Penting/Bahaya (Merah)</span>
                                     </label>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4 pt-4">
                              <h3 className="text-sm font-bold text-gray-400 uppercase border-b border-gray-100 pb-2">Footer</h3>
                              <Input label="Teks Copyright" value={profile.footerText || ''} onChange={(e) => onUpdateProfile({...profile, footerText: e.target.value})} placeholder="© 2025..." />
                          </div>
                          <div className="bg-red-50 p-6 rounded-xl border border-red-100 space-y-4">
                              <h3 className="text-sm font-bold text-red-800 uppercase flex items-center gap-2"><Lock size={14}/> Reset Password Admin</h3>
                              <div className="grid gap-4">
                                <div className="relative">
                                  <Input className="bg-white pr-10" type={showNewPassword ? "text" : "password"} label="Password Baru" placeholder="Minimal 6 karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-emerald-600">{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                                <Input className="bg-white" type={showNewPassword ? "text" : "password"} label="Konfirmasi Password" placeholder="Ketik ulang password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                {passwordError && <div className="flex items-center gap-2 text-xs text-red-600 font-medium bg-red-100 p-2 rounded"><AlertTriangle size={12} /> {passwordError}</div>}
                                <div className="pt-2">
                                  <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={handleUpdatePassword} 
                                    disabled={!newPassword || !confirmPassword || isSavingPassword} 
                                    className="w-full justify-center bg-red-600 text-white hover:bg-red-700 border-transparent shadow-lg shadow-red-200"
                                  >
                                    {isSavingPassword ? (
                                        <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><CheckCircle size={16} /> Update Password</>
                                    )}
                                  </Button>
                                  <p className="text-[10px] text-red-600/70 mt-2 text-center">*Harap ingat password baru Anda. Perubahan akan langsung aktif.</p>
                                </div>
                              </div>
                          </div>
                        </div>
                        <div className="fixed bottom-6 right-6 md:static flex justify-end"><Button onClick={handleSaveProfile} className="shadow-xl shadow-emerald-500/20 py-3 px-8 text-base"><Save size={18} /> Simpan Data Umum</Button></div>
                    </div>
                  )}
               </div>
            </div>
            <div className={`
                hidden xl:flex bg-gray-100/50 border-l border-gray-200 relative shrink-0 flex-col items-center
                transition-all duration-300 ease-in-out
                ${showPreview ? 'w-[380px] p-6' : 'w-0 p-0 overflow-hidden border-none'}
            `}>
               <div className="w-[330px] flex flex-col items-center h-full sticky top-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Eye size={14}/> Live Preview</h3>
                  <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[2.5rem] ring-4 ring-gray-200 shadow-2xl overflow-hidden select-none">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                      <div className="w-full h-full bg-slate-50 overflow-y-auto scrollbar-hide rounded-[2rem]">
                         <PublicView blocks={blocks} profile={profile} socials={socials} isPreview={true} />
                      </div>
                  </div>
                  <div className="mt-6 text-center px-4"><p className="text-[10px] text-gray-400">Tampilan ini adalah simulasi. Hasil akhir mungkin sedikit berbeda tergantung perangkat pengguna.</p></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
