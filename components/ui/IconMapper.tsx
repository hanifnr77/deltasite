
import React from 'react';
import { Globe, Instagram, Youtube, Phone, Facebook, Linkedin, Twitter, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { SocialPlatform } from '../../types';

interface IconMapperProps {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}

export const IconMapper: React.FC<IconMapperProps> = ({ platform, size = 20, className = '' }) => {
  switch (platform) {
    case 'website': return <Globe size={size} className={className} />;
    case 'instagram': return <Instagram size={size} className={className} />;
    case 'youtube': return <Youtube size={size} className={className} />;
    case 'whatsapp': return <Phone size={size} className={className} />;
    case 'facebook': return <Facebook size={size} className={className} />;
    case 'linkedin': return <Linkedin size={size} className={className} />;
    case 'twitter': return <Twitter size={size} className={className} />; // X / Twitter
    case 'tiktok': return (
      // Custom SVG for TikTok as Lucide might not have it or to ensure specific look
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
    case 'threads': return <MessageCircle size={size} className={className} />; // Proxy icon
    default: return <LinkIcon size={size} className={className} />;
  }
};
