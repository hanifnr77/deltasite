import React, { useState, useEffect } from 'react';

// --- BAGIAN IMPORT (Jalur Penghubung) ---
// Pastikan jalur ini sesuai dengan lokasi file Bapak
import { AdminView } from './components/admin/AdminView';
import { PublicView } from './components/public/PublicView';
import { UserProfile, LinkItem, Block } from './types';
import { storageService } from './services/storageService';

// Ikon Loading (Opsional, pakai text biasa jika error)
import { Loader2 } from 'lucide-react';

// Data Default (Jika spreadsheet kosong/belum load)
const INITIAL_PROFILE: UserProfile = {
  name: "Madrasah Hebat",
  bio: "Selamat datang di aplikasi layanan digital kami.",
  avatar: "https://via.placeholder.com/150",
  theme: "emerald" // Ganti sesuai selera default
};

function App() {
  // State untuk Login (Admin vs User)
  // Ubah 'true' jadi 'false' jika ingin defaultnya User biasa
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  // State Data Website
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [socialLinks, setSocialLinks] = useState<LinkItem[]>([]);

  // 1. LOAD DATA: Ambil dari Spreadsheet saat web dibuka
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mengambil data lewat "Link Sakti" StorageService
      const data = await storageService.fetchAllData();
      if (data) {
        if (data.profile) setProfile(data.profile);
        if (data.blocks) setBlocks(data.blocks);
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. SIMPAN DATA: Fungsi yang dipanggil saat tombol Save ditekan
  const handleSave = async (
    newProfile: UserProfile, 
    newBlocks: Block[], 
    newSocials: LinkItem[]
  ) => {
    // Update tampilan di layar (biar cepat)
    setProfile(newProfile);
    setBlocks(newBlocks);
    setSocialLinks(newSocials);

    // Kirim ke Spreadsheet (Proses Background)
    try {
      await storageService.saveAllData({
        profile: newProfile,
        blocks: newBlocks,
        socialLinks: newSocials
      });
      alert("✅ Sukses! Perubahan berhasil disimpan ke database.");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert("❌ Gagal menyimpan. Periksa koneksi internet Anda.");
    }
  };

  // Tampilan saat Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-medium">Sedang menghubungkan ke Madrasah...</p>
      </div>
    );
  }

  // Tampilan Utama (Switch antara Admin & Public)
  return (
    <>
      {isAdmin ? (
        // --- TAMPILAN ADMIN (Mode Edit) ---
        <AdminView 
          initialProfile={profile}
          initialBlocks={blocks}
          initialSocialLinks={socialLinks}
          onSave={handleSave}
          // Tombol Logout sederhana (kembali ke public)
          onLogout={() => setIsAdmin(false)} 
        />
      ) : (
        // --- TAMPILAN PUBLIK (User/Wali Murid) ---
        <div className="relative">
           {/* Tombol Rahasia Masuk Admin */}
           {/* Letaknya di pojok kanan bawah, transparan/samar */}
           <button 
             onClick={() => setIsAdmin(true)}
             className="fixed bottom-4 right-4 z-50 p-3 bg-white/20 text-gray-300 hover:bg-white hover:text-gray-800 rounded-full shadow-sm transition-all text-xs border border-transparent hover:border-gray-300"
             title="Masuk Mode Admin"
           >
             ⚙️ Edit
           </button>

           <PublicView 
             profile={profile}
             blocks={blocks}
             socialLinks={socialLinks}
           />
        </div>
      )}
    </>
  );
}

export default App;
