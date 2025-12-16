import { Block, UserProfile, SocialLinkItem } from '../types';

// --- KONFIGURASI URL ---
// Ini adalah alamat "Jembatan" ke Google Spreadsheet Bapak
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxjqOgYHLS6_09KkycICNK0NHXVFifVn_IxlTa1sRapq2xOPgVe88QGdKn6AEn7fBHv/exec';

const BLOCKS_KEY = 'mtsn8_blocks';
const PROFILE_KEY = 'mtsn8_profile';
const SOCIALS_KEY = 'mtsn8_socials';

// --- DATA DEFAULT (Cadangan jika database kosong/error) ---
const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'soc_pos_default',
    type: 'social_embed',
    audience: 'all'
  },
  {
    id: 'b0',
    type: 'text',
    content: 'Selamat datang di New Deltasite MTsN 8 Tulungagung.',
    align: 'center',
    format: { bold: false, italic: false, underline: false },
    listType: 'none',
    audience: 'all'
  },
  { 
    id: 'b1', 
    type: 'link', 
    title: 'Website Resmi Madrasah', 
    url: 'https://mtsn8tulungagung.sch.id', 
    active: true, 
    clicks: 0, 
    displayMode: 'solid', 
    customColor: '#059669',
    audience: 'all'
  }
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
  footerText: '© 2025 MTsN 8 Tulungagung. Part Of DeltaZone'
};

// --- API METHODS ---

// 1. AMBIL DATA (READ)
export const fetchAllData = async (): Promise<{ blocks: Block[], profile: UserProfile, socials: SocialLinkItem[] }> => {
  try {
    console.log("Mengambil data dari Spreadsheet...");
    const response = await fetch(SCRIPT_URL);
    
    if (!response.ok) {
      throw new Error('Gagal menghubungi server GAS');
    }

    const data = await response.json();
    
    // Validasi data yang masuk
    if (data && data.blocks) {
      console.log("Data berhasil dimuat!", data);
      return {
        blocks: data.blocks,
        profile: data.profile || DEFAULT_PROFILE,
        socials: data.socials || DEFAULT_SOCIALS
      };
    } else {
      console.warn("Data kosong, menggunakan default.");
      return { blocks: DEFAULT_BLOCKS, profile: DEFAULT_PROFILE, socials: DEFAULT_SOCIALS };
    }

  } catch (error) {
    console.error("Gagal mengambil data, menggunakan LocalStorage/Default sebagai fallback:", error);
    
    // Fallback ke LocalStorage jika internet mati / server error
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

// 2. SIMPAN DATA (WRITE)
export const saveAllData = async (blocks: Block[], profile: UserProfile, socials: SocialLinkItem[]) => {
  // Simpan ke LocalStorage dulu (Optimistic UI - biar user merasa cepat)
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SOCIALS_KEY, JSON.stringify(socials));

  try {
    console.log("Menyimpan ke Spreadsheet...");
    
    // Kirim data menggunakan POST Request
    // Gunakan 'no-cors' jika mengalami masalah CORS, tapi idealnya standard POST
    // Kita gunakan trik text/plain agar tidak kena preflight options
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        data: { blocks, profile, socials }
      })
    });

    const result = await response.json();
    console.log("Simpan Berhasil:", result);

  } catch (error) {
    console.error("Gagal menyimpan ke Cloud (Data tersimpan di LocalStorage):", error);
    // Kita tidak throw error agar aplikasi tidak crash, karena data sudah aman di LocalStorage
  }
};

// 3. UPLOAD GAMBAR
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        // Ambil Base64 murni (buang prefix "data:image/...")
        const base64Data = dataUrl.split(',')[1];

        console.log("Mengupload gambar...");
        
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
        
        if (result && result.url) {
          console.log("Upload Sukses:", result.url);
          resolve(result.url);
        } else {
          reject("Gagal mendapatkan URL gambar.");
        }

      } catch (error) {
        console.error("Upload Error:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
