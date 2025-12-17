import { Block, UserProfile, SocialLinkItem, AppSettings } from '../types';

// --- KONFIGURASI URL ---
// Pastikan URL ini adalah deployment TERBARU (New Version) dari Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxjqOgYHLS6_09KkycICNK0NHXVFifVn_IxlTa1sRapq2xOPgVe88QGdKn6AEn7fBHv/exec';

const BLOCKS_KEY = 'mtsn8_blocks';
const PROFILE_KEY = 'mtsn8_profile';
const SOCIALS_KEY = 'mtsn8_socials';

// --- DATA DEFAULT ---
const DEFAULT_BLOCKS: Block[] = [
  { id: 'b0', type: 'text', content: 'Selamat Datang', align: 'center', format: { bold: true }, listType: 'none', audience: 'all' }
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Microsite MTsN 8 Tulungagung',
  bio: 'Sinergi Digital Madrasah',
  avatarUrl: 'https://placehold.co/150x150',
  themeColor: 'green',
  adminPassword: 'admin', // Ini hanya fallback local
  footerText: '© 2025 MTsN 8 Tulungagung'
};

// --- API METHODS UTAMA (WEBSITE DATA) ---

export const fetchAllData = async () => {
  try {
    // Panggil script tanpa parameter = Default Load Data (sesuai code.gs)
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error('Gagal fetch data');
    const data = await response.json();
    
    return {
      blocks: data.blocks || DEFAULT_BLOCKS,
      profile: data.profile || DEFAULT_PROFILE,
      socials: data.socials || []
    };
  } catch (error) {
    console.error("Load Error (Fallback Local):", error);
    const b = localStorage.getItem(BLOCKS_KEY);
    const p = localStorage.getItem(PROFILE_KEY);
    const s = localStorage.getItem(SOCIALS_KEY);
    return {
      blocks: b ? JSON.parse(b) : DEFAULT_BLOCKS,
      profile: p ? JSON.parse(p) : DEFAULT_PROFILE,
      socials: s ? JSON.parse(s) : []
    };
  }
};

export const saveAllData = async (blocks: Block[], profile: UserProfile, socials: SocialLinkItem[]) => {
  // 1. Simpan Lokal dulu (Biar cepat terasa di UI)
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SOCIALS_KEY, JSON.stringify(socials));

  try {
    // 2. Kirim ke Google Apps Script via POST
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save', // Sesuai logika code.gs lama
        data: { blocks, profile, socials }
      })
    });
    console.log("Data website tersimpan di Cloud.");
  } catch (error) {
    console.error("Gagal simpan ke Cloud:", error);
  }
};

// --- FUNGSI UPLOAD GAMBAR ---
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(',')[1];

        console.log("Mengupload gambar ke Drive...");
        
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'upload', // Sesuai logika code.gs lama
            file: base64Data,
            mimeType: file.type,
            fileName: file.name
          })
        });

        const result = await response.json();
        
        if (result.status === 'success' && result.url) {
          resolve(result.url);
        } else {
          reject("Gagal upload: " + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error("Upload Error:", error);
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
};

// --- 👇 FUNGSI BARU: KEAMANAN / SETTINGS (Password) 👇 ---

// 1. Ambil Password dari Sheet "Settings"
export const fetchSettings = async (): Promise<AppSettings> => {
  try {
    // Memanggil action=getSettings di code.gs
    const response = await fetch(`${SCRIPT_URL}?action=getSettings`);
    if (!response.ok) throw new Error('Gagal fetch settings');
    return await response.json(); 
  } catch (error) {
    console.error("Gagal ambil settings:", error);
    // Jika gagal (misal offline), kembalikan default sementara
    return { admin_password: 'admin123' }; 
  }
};

// 2. Update Password ke Sheet "Settings"
export const saveSetting = async (key: string, value: string): Promise<void> => {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      // Gunakan 'no-cors' jika mengalami masalah CORS pada POST sederhana, 
      // tapi biasanya fetch standar oke untuk Apps Script text/plain response.
      // Kita coba standar dulu:
      body: JSON.stringify({
        action: 'updateSetting',
        key: key,
        value: value
      })
    });
    console.log(`Setting ${key} berhasil diupdate.`);
  } catch (error) {
    console.error("Gagal update setting:", error);
    throw error;
  }
};
