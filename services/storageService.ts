
import { Block, UserProfile, SocialLinkItem } from '../types';

const BLOCKS_KEY = 'mtsn8_blocks';
const PROFILE_KEY = 'mtsn8_profile';
const SOCIALS_KEY = 'mtsn8_socials';

// --- Default Data ---
const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'soc_pos_default',
    type: 'social_embed' // Defaultnya ditaruh di atas
  },
  {
    id: 'b0',
    type: 'text',
    content: 'Layanan Utama',
    align: 'center',
    format: { bold: true, italic: false, underline: false },
    listType: 'none'
  },
  { 
    id: 'b1', 
    type: 'link',
    title: 'Website Resmi Madrasah', 
    url: 'https://mtsn8tulungagung.sch.id', 
    active: true, 
    clicks: 1250,
    displayMode: 'solid',
    customColor: '#059669'
  },
  {
    id: 'd1',
    type: 'divider',
    height: 'md',
    showLine: true,
    lineStyle: 'dashed'
  },
  { 
    id: 'b4', 
    type: 'link',
    title: 'E-Learning Madrasah', 
    url: '#', 
    active: true, 
    clicks: 3400,
    displayMode: 'outline'
  },
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

// --- GAS Helper Types ---
declare const google: any;

// Check if we are in Google Apps Script environment
const isGasEnvironment = () => {
  return typeof google !== 'undefined' && google.script && google.script.run;
};

// Helper to wrap google.script.run in a Promise
const serverCall = (funcName: string, ...args: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isGasEnvironment()) {
      reject('Not in GAS environment');
      return;
    }
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler((error: any) => reject(error))
      [funcName](...args);
  });
};

// --- API Methods ---

export const fetchAllData = async (): Promise<{ blocks: Block[], profile: UserProfile, socials: SocialLinkItem[] }> => {
  if (isGasEnvironment()) {
    try {
      const data = await serverCall('apiGetAllData');
      // Jika data kosong (sheet baru), gunakan default
      return {
        blocks: data.blocks || DEFAULT_BLOCKS,
        profile: data.profile || DEFAULT_PROFILE,
        socials: data.socials || DEFAULT_SOCIALS
      };
    } catch (e) {
      console.error("GAS Load Error", e);
      return { blocks: DEFAULT_BLOCKS, profile: DEFAULT_PROFILE, socials: DEFAULT_SOCIALS };
    }
  } else {
    // LocalStorage Fallback (Development Mode)
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
  if (isGasEnvironment()) {
    await serverCall('apiSaveAllData', { blocks, profile, socials });
  } else {
    // LocalStorage Fallback
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(SOCIALS_KEY, JSON.stringify(socials));
  }
};

export const saveBlocks = async (blocks: Block[]) => {
  if (isGasEnvironment()) {
    // GAS logic handled in App.tsx typically, but specific saves can be routed here
  } else {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  }
};

/**
 * Uploads an image to Google Drive via GAS Backend.
 * Returns the public URL of the image.
 */
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      if (isGasEnvironment()) {
        try {
          // Extract Base64 data (remove "data:image/png;base64," prefix)
          const base64Data = dataUrl.split(',')[1];
          const fileName = file.name;
          const mimeType = file.type;

          // Panggil fungsi backend 'apiUploadImage'
          const response = await serverCall('apiUploadImage', base64Data, mimeType, fileName);
          
          if (response && response.url) {
            resolve(response.url);
          } else {
            reject("Gagal mendapatkan URL dari server.");
          }
        } catch (error) {
          console.error("Upload Error:", error);
          reject(error);
        }
      } else {
        // Development Mode: Return Base64 directly
        console.warn("Dev Mode: Menggunakan Base64 local, bukan Google Drive.");
        // Simulate network delay
        setTimeout(() => resolve(dataUrl), 1000);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
