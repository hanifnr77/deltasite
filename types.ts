
export type SocialPlatform = 'website' | 'whatsapp' | 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin' | 'threads' | 'other';

export interface SocialLinkItem {
  id: string;
  platform: SocialPlatform;
  url: string;
  active: boolean;
  customLabel?: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  themeColor: 'blue' | 'purple' | 'green';
  adminPassword?: string; // Password dinamis
  footerText?: string; // Teks footer custom
}

// --- Block System ---

export type BlockType = 'link' | 'text' | 'divider' | 'image_grid' | 'social_embed' | 'youtube' | 'map';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  title: string;
  subtitle?: string; // Field Baru: Subjudul Opsional
  url: string;
  active: boolean;
  clicks: number;
  image?: string; // URL or Base64
  customColor?: string; // Hex Code
  textColor?: string; // Hex Code
  displayMode?: 'solid' | 'image' | 'outline';
  category?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  align: 'left' | 'center' | 'right' | 'justify';
  format: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
  listType?: 'none' | 'bullet' | 'number';
  // New Styles
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  textColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLine: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
  lineOpacity?: number; // 10-100
}

export interface ImageGridItem {
  id: string;
  url: string;
  caption?: string; // Alt text or visible caption
  linkUrl?: string; // Optional link when clicked
}

export interface ImageGridBlock extends BaseBlock {
  type: 'image_grid';
  columns: 1 | 2 | 3 | 4;
  aspectRatio: 'square' | 'video' | 'portrait' | 'auto';
  gap: 'sm' | 'md' | 'none';
  items: ImageGridItem[];
}

export interface SocialEmbedBlock extends BaseBlock {
  type: 'social_embed';
  // Tidak butuh properti lain, karena data diambil dari global state 'socials'
}

export interface YoutubeBlock extends BaseBlock {
  type: 'youtube';
  url: string;
  title?: string;
}

export interface MapBlock extends BaseBlock {
  type: 'map';
  embedUrl: string;
  title?: string;
}

export type Block = LinkBlock | TextBlock | DividerBlock | ImageGridBlock | SocialEmbedBlock | YoutubeBlock | MapBlock;
