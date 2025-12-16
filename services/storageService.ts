import { Block, UserProfile, SocialLinkItem } from '../types';

// --- KONFIGURASI URL ---
// GANTI DENGAN URL WEB APP BAPAK YANG BERAKHIRAN /exec
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
  adminPassword: 'admin',
  footerText: '© 2025 MTsN 8 Tulungagung'
};

// --- API METHODS ---

export const fetchAllData = async () => {
  try {
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
  // Simpan Lokal dulu (Biar cepat)
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SOCIALS_KEY, JSON.stringify(socials));

  try {
    // Kirim ke Google Apps Script via POST
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        data: { blocks, profile, socials }
      })
    });
    console.log("Data tersimpan di Cloud.");
  } catch (error) {
    console.error("Gagal simpan ke Cloud:", error);
  }
};

// --- FUNGSI UPLOAD GAMBAR (YANG DIPERBAIKI) ---
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        // Ambil Base64 murni tanpa prefix "data:image/..."
        const base64Data = dataUrl.split(',')[1];

        console.log("Mengupload gambar ke Drive...");
        
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'upload',
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
