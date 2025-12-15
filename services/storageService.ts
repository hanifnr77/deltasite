import { Block, UserProfile, SocialLinkItem } from '../types';

const BLOCKS_KEY = 'mtsn8_blocks';
const PROFILE_KEY = 'mtsn8_profile';
const SOCIALS_KEY = 'mtsn8_socials';

// --- MASUKKAN LINK SAKTI ANDA DI SINI (Di dalam tanda kutip) ---
const API_URL = 'https://script.google.com/macros/s/AKfycbxjqOgYHLS6_09KkycICNK0NHXVFifVn_IxlTa1sRapq2xOPgVe88QGdKn6AEn7fBHv/exec'; 

// --- Default Data (Data bawaan jika database kosong) ---
const DEFAULT_BLOCKS: Block[] = [
  { id: 'soc_pos_default', type: 'social_embed' },
  { id: 'b0', type: 'text', content: 'Layanan Utama', align: 'center', format: { bold: true, italic: false, underline: false }, listType: 'none' },
  { id: 'b1', type: 'link', title: 'Website Resmi Madrasah', url: 'https://mtsn8tulungagung.sch.id', active: true, clicks: 1250, displayMode: 'solid', customColor: '#059669' },
  { id: 'd1', type: 'divider', height: 'md', showLine: true, lineStyle: 'dashed' },
  { id: 'b4', type: 'link', title: 'E-Learning Madrasah', url: '#', active: true, clicks: 3400, displayMode: 'outline' },
];

const DEFAULT_SOCIALS: SocialLinkItem[] = [
  { id: 's1', platform: 'website', url: 'https://mtsn8tulungagung.sch.id', active: true },
  { id: 's2', platform: 'instagram', url: 'https://instagram.com', active: true },
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Microsite MTsN 8 Tulungagung',
  bio: 'Sinergi Digital Madrasah: Akses Layanan & Informasi Pendidikan Terintegrasi.',
  avatarUrl: 'https://iili.io/f2LWiwG.png',
  themeColor: 'green',
  adminPassword: 'admin',
  footerText: '© 2025 MTsN 8 Tulungagung. Part Of DeltaZone - Transformasi Digital Madrasah.'
};

// --- API Methods (Menggunakan FETCH standar) ---

export const fetchAllData = async (): Promise<{ blocks: Block[], profile: UserProfile, socials: SocialLinkItem[] }> => {
  try {
    // Kita coba ambil data dari Spreadsheet
    console.log("Mengambil data dari server...");
    const response = await fetch(API_URL);
    const data = await response.json();

    // Cek apakah data valid (ada blocks, profile, dll)
    if (data && data.blocks) {
      return {
        blocks: data.blocks,
        profile: data.profile || DEFAULT_PROFILE,
        socials: data.socials || DEFAULT_SOCIALS
      };
    } else {
      // Jika data di spreadsheet masih kosong, gunakan default
      console.log("Data server kosong, menggunakan default.");
      return { blocks: DEFAULT_BLOCKS, profile: DEFAULT_PROFILE, socials: DEFAULT_SOCIALS };
    }
  } catch (e) {
    console.error("Gagal load dari server, menggunakan LocalStorage/Default:", e);
    // Fallback ke penyimpanan browser jika internet mati
    const b = localStorage.getItem(BLOCKS_KEY);
    const p = localStorage.getItem(PROFILE_KEY);
    const s = localStorage.getItem(SOCIALS_KEY);
    return {
      blocks: b ? JSON.parse(b) : DEFAULT_BLOCKS,
      profile: p ? JSON.parse(p) : DEFAULT_PROFILE,
      socials: s ? JSON.parse(s) : DEFAULT_SOCIALS
    };
  }
};

export const saveAllData = async (blocks: Block[], profile: UserProfile, socials: SocialLinkItem[]) => {
  // 1. Simpan ke LocalStorage dulu (biar cepat/antisipasi error)
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SOCIALS_KEY, JSON.stringify(socials));

  // 2. Simpan ke Google Spreadsheet (Server)
  try {
    const payload = {
      blocks: blocks,
      profile: profile,
      socials: socials
    };

    // Teknik khusus agar tidak kena blokir CORS (menggunakan text/plain)
    await fetch(`${API_URL}?action=save`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    console.log("Berhasil tersimpan di Server/Spreadsheet!");
  } catch (e) {
    console.error("Gagal menyimpan ke server:", e);
    alert("Data tersimpan di Browser, tapi gagal naik ke Server. Cek koneksi internet.");
  }
};

export const saveBlocks = async (blocks: Block[]) => {
  // Fungsi parsial, kita simpan ke local saja biar ringan
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
};

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Karena hosting gratisan & Spreadsheet terbatas, 
      // kita ubah gambar jadi teks panjang (Base64)
      // Ini cara paling mudah tanpa server storage khusus.
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
