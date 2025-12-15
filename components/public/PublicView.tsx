
import React from 'react';
import { Block, LinkBlock, TextBlock, DividerBlock, ImageGridBlock, UserProfile, SocialLinkItem } from '../../types';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { IconMapper } from '../ui/IconMapper';

interface PublicViewProps {
  blocks: Block[];
  profile: UserProfile;
  socials: SocialLinkItem[];
  isPreview?: boolean; // New prop for admin preview mode
}

export const PublicView: React.FC<PublicViewProps> = ({ blocks, profile, socials, isPreview = false }) => {
  const activeSocials = socials.filter(s => s.active && s.url);
  const currentYear = new Date().getFullYear();
  
  // Backward Compatibility:
  const hasSocialEmbedBlock = blocks.some(b => b.type === 'social_embed');

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
    }
  };

  const renderSocials = () => {
    if (activeSocials.length === 0) return null;
    return (
      <div className="flex flex-wrap justify-center gap-3 w-full my-2 animate-fade-in">
        {activeSocials.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:scale-110 hover:text-emerald-600 hover:border-emerald-200 transition-all duration-300"
          >
            <IconMapper platform={social.platform} size={22} />
          </a>
        ))}
      </div>
    );
  };

  const renderLink = (link: LinkBlock) => {
    const isImageMode = link.displayMode === 'image' && !!link.image;
    // Cek apakah ada custom color, abaikan mode gambar untuk penentuan background
    const hasCustomColor = !!link.customColor;
    
    // Style container utama: Gunakan customColor jika ada
    const containerStyle: React.CSSProperties = hasCustomColor 
      ? { 
          backgroundColor: link.customColor,
          borderColor: 'transparent'
        }
      : {}; 

    // Tentukan apakah teks harus putih (karena background berwarna) atau gelap (background putih)
    // Jika ada customColor -> Teks Putih
    // Jika tidak ada customColor -> Teks Gelap
    const isDarkBackground = hasCustomColor;

    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className={`group block w-full transform transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div 
          className={`
            relative flex items-stretch rounded-2xl transition-all duration-300 overflow-hidden
            ${!isDarkBackground ? 'bg-white/80 backdrop-blur-sm border border-emerald-100/50 shadow-sm hover:shadow-xl hover:shadow-emerald-200/20 hover:border-emerald-300' : 'shadow-md hover:shadow-xl bg-white'}
          `}
          style={containerStyle}
        >
          
          {/* --- BAGIAN KIRI: Gambar ATAU Ikon --- */}
          {isImageMode ? (
            // Layout KIRI: Gambar Thumbnail FIXED SIZE
            // Menggunakan w-24 (96px) fix untuk mencegah expansion berlebih
            <div className="w-24 shrink-0 relative overflow-hidden bg-gray-100 border-r border-black/5">
               <img 
                 src={link.image} 
                 alt={link.title}
                 className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 absolute inset-0" 
               />
               {/* Overlay tipis agar batas gambar terlihat halus jika gambar putih */}
               <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>
          ) : (
            // Layout KIRI: Ikon Biasa
            <div className="pl-4 py-4 flex items-center justify-center">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-all duration-300 shrink-0
                  ${isDarkBackground ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}
                `}>
                  <ExternalLink size={20} />
                </div>
            </div>
          )}

          {/* --- BAGIAN TENGAH: Teks --- */}
          <div className={`flex-1 flex flex-col justify-center min-w-0 py-3 ${isImageMode ? 'px-4' : 'px-4'}`}>
            <span className={`
              font-heading font-bold text-sm md:text-base leading-tight
              ${isDarkBackground ? 'text-white' : 'text-gray-800 group-hover:text-emerald-700 transition-colors'}
            `}>
              {link.title}
            </span>
            
            {/* Render Subtitle */}
            {link.subtitle && (
              <span className={`
                text-xs font-medium mt-1 line-clamp-2
                ${isDarkBackground ? 'text-white/90' : 'text-gray-500'}
              `}>
                {link.subtitle}
              </span>
            )}

            {/* Render Category Badge */}
            {!isImageMode && link.category && (
              <span className={`
                text-[10px] uppercase font-bold tracking-wide mt-1.5
                ${isDarkBackground ? 'text-white/80' : 'text-gray-400 group-hover:text-emerald-600/70'}
              `}>
                {link.category}
              </span>
            )}
          </div>
          
          {/* --- BAGIAN KANAN: Panah Link --- */}
          <div className="pr-4 py-4 flex items-center justify-center">
            <div className={`
              w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0
              ${isDarkBackground ? 'text-white/60 bg-white/10' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}
            `}>
              <ExternalLink size={14} />
            </div>
          </div>

        </div>
      </a>
    );
  };

  const renderText = (block: TextBlock) => {
    const textAlignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    }[block.align];

    const fontSizeClass = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }[block.fontSize || 'base'];

    const fontFamilyClass = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono',
    }[block.fontFamily || 'sans'];

    const contentClass = `
      ${block.format.bold ? 'font-bold' : 'font-normal'} 
      ${block.format.italic ? 'italic' : ''} 
      ${block.format.underline ? 'underline decoration-emerald-400 decoration-2 underline-offset-2' : ''}
      ${textAlignClass} ${fontSizeClass} ${fontFamilyClass}
      font-heading leading-relaxed
    `;

    // Custom text color or default gray
    const style: React.CSSProperties = block.textColor ? { color: block.textColor } : {};

    const wrapperClassName = `w-full px-2 py-2 ${contentClass} ${!block.textColor ? 'text-gray-700' : ''}`;

    if (block.listType === 'number') {
       const items = block.content.split('\n').filter(i => i.trim());
       return (
         <div className={wrapperClassName} style={style}>
            <ol className="list-decimal list-inside space-y-1 marker:font-bold">
               {items.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
         </div>
       );
    }

    if (block.listType === 'bullet') {
       const items = block.content.split('\n').filter(i => i.trim());
       return (
         <div className={wrapperClassName} style={style}>
            <ul className="list-disc list-inside space-y-1">
               {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
         </div>
       );
    }

    return (
      <div className={wrapperClassName} style={style}>
         <p className="whitespace-pre-line">{block.content}</p>
      </div>
    );
  };

  const renderDivider = (block: DividerBlock) => {
    const heights = { xs: 'h-4', sm: 'h-8', md: 'h-12', lg: 'h-24', xl: 'h-32' };
    const heightClass = heights[block.height] || 'h-8';
    
    // Wavy using SVG pattern
    if (block.lineStyle === 'wavy') {
      return (
        <div className={`w-full flex items-center justify-center ${heightClass}`}>
          {block.showLine && (
            <div className="w-full h-2 bg-repeat-x opacity-30" 
                 style={{ 
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q5 0 10 5 T20 5' fill='none' stroke='%2394a3b8' stroke-width='2'/%3E%3C/svg%3E")`,
                   backgroundSize: '20px 10px'
                 }}>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`w-full flex items-center justify-center ${heightClass}`}>
        {block.showLine && (
           <div 
              className={`w-full border-t-2 border-gray-300/50`}
              style={{ 
                borderStyle: (block.lineStyle === 'double' ? 'double' : block.lineStyle) as any || 'solid',
                borderTopWidth: block.lineStyle === 'double' ? '4px' : '2px'
              }}
           ></div>
        )}
      </div>
    );
  };

  const renderImageGrid = (block: ImageGridBlock) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[block.columns];

    const aspectRatio = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
      auto: '',
    }[block.aspectRatio];

    const gap = {
      sm: 'gap-1',
      md: 'gap-3',
      none: 'gap-0',
    }[block.gap];

    return (
      <div className={`w-full grid ${gridCols} ${gap}`}>
        {block.items.map((item) => {
          const Content = () => (
            <div className={`relative overflow-hidden rounded-xl bg-gray-100 group ${aspectRatio} ${block.aspectRatio === 'auto' ? 'min-h-[100px]' : ''}`}>
              <img 
                src={item.url} 
                alt={item.caption || 'Grid Image'} 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105`}
              />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-[10px] font-medium truncate backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.caption}
                </div>
              )}
            </div>
          );

          if (item.linkUrl) {
            return (
              <a 
                key={item.id} 
                href={item.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={handleLinkClick}
                className="block hover:opacity-90 transition-opacity"
              >
                <Content />
              </a>
            );
          }

          return <div key={item.id}><Content /></div>;
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center overflow-x-hidden bg-[#f8fafc] ${isPreview ? 'pointer-events-none' : ''}`}>
      
      {/* Dynamic Geometric Background */}
      <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 bg-slate-50`}>
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-emerald-100/40 blur-[100px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-teal-100/40 blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#059669 1px, transparent 1px), linear-gradient(to right, #059669 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-lg flex flex-col items-center gap-6 pt-16 pb-12 px-6 ${isPreview ? 'pt-8 pb-8 scale-95 origin-top' : ''}`}>
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center gap-5 animate-fade-in w-full">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 blur-xl opacity-20 group-hover:opacity-40 transition-duration-500 scale-110"></div>
            <div className="relative bg-white p-3 rounded-full shadow-xl shadow-emerald-100 ring-4 ring-white">
              <img src={profile.avatarUrl} alt={profile.name} className="w-28 h-28 rounded-full object-contain bg-white" />
            </div>
             <div className="absolute bottom-2 right-1 bg-white rounded-full p-1 shadow-md z-20">
                <CheckCircle size={20} className="text-emerald-500 fill-emerald-50" />
             </div>
          </div>

          <div className="space-y-3 max-w-md w-full">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800 tracking-tight leading-tight">
              {profile.name}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed px-2">
              {profile.bio}
            </p>
            
            <div className="inline-flex items-center gap-2 mt-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                 Berpacu dan Terus Maju
               </span>
            </div>
          </div>
        </div>

        {/* Horizontal Social Links - LEGACY FALLBACK */}
        {!hasSocialEmbedBlock && activeSocials.length > 0 && renderSocials()}

        {/* Blocks Container */}
        <div className="w-full space-y-4 mt-4">
          {blocks.map((block, idx) => {
            if (block.type === 'link' && !(block as LinkBlock).active) return null;
            
            return (
               <div key={block.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in w-full">
                  {block.type === 'link' && renderLink(block as LinkBlock)}
                  {block.type === 'text' && renderText(block as TextBlock)}
                  {block.type === 'divider' && renderDivider(block as DividerBlock)}
                  {block.type === 'image_grid' && renderImageGrid(block as ImageGridBlock)}
                  {block.type === 'social_embed' && renderSocials()}
               </div>
            );
          })}

          {blocks.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/50 border border-dashed border-gray-300 backdrop-blur-sm">
              <p className="text-gray-500 font-medium text-sm">Belum ada konten.</p>
            </div>
          )}
        </div>
        
        <footer className="mt-16 flex flex-col items-center gap-3 text-center">
           <div className="w-16 h-1 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full opacity-50"></div>
           <div className="space-y-1">
             <p className="text-xs font-semibold text-gray-500">
               {profile.footerText || `© ${currentYear} MTsN 8 Tulungagung`}
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};
