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
            // Updated social buttons to glow
            className="p-3 bg-white/5 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-[#00B7B5] hover:scale-110 hover:bg-[#00B7B5] hover:text-[#005461] hover:shadow-[0_0_15px_rgba(0,183,181,0.5)] transition-all duration-300"
          >
            <IconMapper platform={social.platform} size={22} />
          </a>
        ))}
      </div>
    );
  };

  const renderLink = (link: LinkBlock) => {
    const isImageMode = link.displayMode === 'image' && !!link.image;
    const hasCustomColor = !!link.customColor;
    
    // Style container: If custom color, use it solid. If not, use Glassmorphism.
    const containerStyle: React.CSSProperties = hasCustomColor 
      ? { 
          backgroundColor: link.customColor,
          borderColor: 'rgba(255,255,255,0.2)'
        }
      : {}; 

    const isGlass = !hasCustomColor;

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
            ${isGlass 
                // Enhanced Glassmorphism with Glow Effect on Hover
                ? 'bg-white/10 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/15 hover:border-[#00B7B5]/50 hover:shadow-[0_0_20px_rgba(0,183,181,0.25)]' 
                : 'shadow-md hover:shadow-xl'
            }
          `}
          style={containerStyle}
        >
          
          {/* --- LEFT: Image/Icon --- */}
          {isImageMode ? (
            <div className="w-24 shrink-0 relative overflow-hidden bg-white/5 border-r border-white/10">
               <img 
                 src={link.image} 
                 alt={link.title}
                 className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 absolute inset-0" 
               />
               <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            </div>
          ) : (
            <div className="pl-4 py-4 flex items-center justify-center">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-all duration-300 shrink-0
                  ${isGlass 
                      ? 'bg-[#005461]/40 text-[#00B7B5] group-hover:bg-[#00B7B5] group-hover:text-[#005461]' 
                      : 'bg-black/20 text-white group-hover:bg-black/10'
                  }
                `}>
                  <ExternalLink size={20} />
                </div>
            </div>
          )}

          {/* --- MIDDLE: Text --- */}
          <div className={`flex-1 flex flex-col justify-center min-w-0 py-3 ${isImageMode ? 'px-4' : 'px-4'}`}>
            <span className="font-heading font-bold text-sm md:text-base leading-tight text-white group-hover:text-[#00B7B5] transition-colors shadow-black/10 drop-shadow-sm">
              {link.title}
            </span>
            
            {link.subtitle && (
              <span className="text-xs font-medium mt-1 line-clamp-2 text-slate-300 group-hover:text-white/90">
                {link.subtitle}
              </span>
            )}

            {!isImageMode && link.category && (
              <span className="text-[10px] uppercase font-bold tracking-wide mt-1.5 text-slate-400 group-hover:text-[#00B7B5]/80">
                {link.category}
              </span>
            )}
          </div>
          
          {/* --- RIGHT: Arrow --- */}
          <div className="pr-4 py-4 flex items-center justify-center">
            <div className={`
              w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0
              ${isGlass 
                  ? 'bg-white/5 text-slate-400 group-hover:bg-[#00B7B5] group-hover:text-[#005461]' 
                  : 'bg-black/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
              }
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
      ${block.format.underline ? 'underline decoration-[#00B7B5] decoration-2 underline-offset-2' : ''}
      ${textAlignClass} ${fontSizeClass} ${fontFamilyClass}
      font-heading leading-relaxed
    `;

    // Default to slate-200 for dark theme readability unless overridden
    const style: React.CSSProperties = block.textColor ? { color: block.textColor } : {};
    const wrapperClassName = `w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 shadow-sm ${contentClass} ${!block.textColor ? 'text-slate-200' : ''}`;

    if (block.listType === 'number') {
       const items = block.content.split('\n').filter(i => i.trim());
       return (
         <div className={wrapperClassName} style={style}>
            <ol className="list-decimal list-inside space-y-1 marker:font-bold marker:text-[#00B7B5]">
               {items.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
         </div>
       );
    }

    if (block.listType === 'bullet') {
       const items = block.content.split('\n').filter(i => i.trim());
       return (
         <div className={wrapperClassName} style={style}>
            <ul className="list-disc list-inside space-y-1 marker:text-[#00B7B5]">
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
    
    if (block.lineStyle === 'wavy') {
      return (
        <div className={`w-full flex items-center justify-center ${heightClass}`}>
          {block.showLine && (
            <div className="w-full h-2 bg-repeat-x opacity-40" 
                 style={{ 
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q5 0 10 5 T20 5' fill='none' stroke='%2300B7B5' stroke-width='2'/%3E%3C/svg%3E")`,
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
              className={`w-full border-t-2 border-[#00B7B5]/30`}
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
            <div className={`relative overflow-hidden rounded-xl bg-white/5 border border-white/10 group ${aspectRatio} ${block.aspectRatio === 'auto' ? 'min-h-[100px]' : ''}`}>
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
    // Updated container background to match app theme for seamless scroll
    // FIXED: Changed min-h-screen to h-full when isPreview to prevent layout overflow in admin
    <div className={`w-full relative flex flex-col items-center overflow-x-hidden bg-gradient-to-br from-[#005461] to-[#018790] text-slate-100 ${isPreview ? 'h-full min-h-full pointer-events-none' : 'min-h-screen'}`}>
      
      {/* Floating Particles Background (Aurora/Ocean Effect) */}
      {/* FIXED: Changed fixed to absolute when isPreview so it doesn't escape the phone container */}
      <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 overflow-hidden pointer-events-none`}>
        {/* Particle 1: Deep Teal */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#005461] opacity-40 blur-[120px] animate-float" />
        {/* Particle 2: Bright Cyan (Accent) */}
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00B7B5] opacity-20 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        {/* Particle 3: Medium Teal */}
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-[#018790] opacity-30 blur-[120px] animate-float" style={{ animationDelay: '5s' }} />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-lg flex flex-col items-center gap-6 pt-16 pb-12 px-6 ${isPreview ? 'pt-8 pb-8 scale-95 origin-top' : ''}`}>
        
        {/* Profile Header (Glass Card) */}
        <div className="flex flex-col items-center text-center gap-5 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in ring-1 ring-white/5">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00B7B5] to-[#018790] blur-xl opacity-40 group-hover:opacity-60 transition-duration-500 scale-110 animate-pulse"></div>
            <div className="relative bg-[#005461]/50 p-2 rounded-full shadow-xl ring-2 ring-white/10">
              <img src={profile.avatarUrl} alt={profile.name} className="w-28 h-28 rounded-full object-contain bg-white" />
            </div>
             <div className="absolute bottom-2 right-1 bg-white rounded-full p-1 shadow-lg shadow-[#00B7B5]/20 z-20">
                <CheckCircle size={20} className="text-[#00B7B5] fill-white" />
             </div>
          </div>

          <div className="space-y-3 w-full">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight leading-tight drop-shadow-md">
              {profile.name}
            </h1>
            <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed px-2">
              {profile.bio}
            </p>
            
            <div className="inline-flex items-center gap-2 mt-2 px-5 py-2 rounded-full bg-[#005461]/30 border border-[#00B7B5]/30 shadow-sm backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-[#00B7B5] animate-pulse shadow-[0_0_8px_#00B7B5]"></span>
               <span className="text-xs font-bold text-[#00B7B5] tracking-wider uppercase">
                 Berpacu dan Terus Maju
               </span>
            </div>
          </div>
        </div>

        {/* Horizontal Social Links */}
        {!hasSocialEmbedBlock && activeSocials.length > 0 && renderSocials()}

        {/* Blocks Container - With Staggered Animation */}
        <div className="w-full space-y-4 mt-2">
          {blocks.map((block, idx) => {
            if (block.type === 'link' && !(block as LinkBlock).active) return null;
            
            return (
               <div 
                 key={block.id} 
                 className="animate-fade-in opacity-0 fill-mode-forwards"
                 style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}
               >
                  {block.type === 'link' && renderLink(block as LinkBlock)}
                  {block.type === 'text' && renderText(block as TextBlock)}
                  {block.type === 'divider' && renderDivider(block as DividerBlock)}
                  {block.type === 'image_grid' && renderImageGrid(block as ImageGridBlock)}
                  {block.type === 'social_embed' && renderSocials()}
               </div>
            );
          })}

          {blocks.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/5 border border-dashed border-white/20 backdrop-blur-sm">
              <p className="text-slate-400 font-medium text-sm">Belum ada konten.</p>
            </div>
          )}
        </div>
        
        <footer className="mt-16 flex flex-col items-center gap-3 text-center opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
           <div className="w-16 h-1 bg-gradient-to-r from-[#005461] via-[#00B7B5] to-[#005461] rounded-full opacity-60"></div>
           <div className="space-y-1">
             {/* FIX: Improved Contrast for Footer Text */}
             <p className="text-xs font-semibold text-slate-300/90 tracking-wide">
               {profile.footerText || `© ${currentYear} MTsN 8 Tulungagung`}
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};
