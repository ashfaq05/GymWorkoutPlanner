import React, { useState } from 'react';
import { ExerciseClipart } from './ExerciseClipart';
import { ExerciseClipartKey } from '../types';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import { isGifUrl } from '../utils/imageUtils';

interface ExerciseImageProps {
  customImageUrl?: string;
  clipartType: ExerciseClipartKey | string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showZoomOnHover?: boolean;
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  customImageUrl,
  clipartType,
  name,
  size = 'md',
  className = '',
  onClick,
  showZoomOnHover = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size styling classes for the image thumbnail
  const sizeClasses = {
    sm: 'w-12 h-10',
    md: 'w-18 h-14 sm:w-20 sm:h-16',
    lg: 'w-28 h-20 sm:w-32 sm:h-24',
    xl: 'w-full h-48 sm:h-56',
  };

  const hasValidCustomImage = Boolean(customImageUrl && !imageError && customImageUrl.trim().length > 0);
  const isGif = hasValidCustomImage && isGifUrl(customImageUrl);

  return (
    <div
      onClick={onClick}
      className={`relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-xs' : ''
      } ${sizeClasses[size]} ${className}`}
      title={
        hasValidCustomImage
          ? isGif
            ? `Animated demonstration for ${name}`
            : `Custom demonstration for ${name}`
          : `${name} diagram`
      }
    >
      {hasValidCustomImage ? (
        <img
          src={customImageUrl}
          alt={name}
          onError={() => setImageError(true)}
          className={`h-full w-full ${isGif ? 'object-contain' : 'object-cover'} object-center transition-transform duration-300 group-hover:scale-105`}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center p-1 text-slate-700">
          <ExerciseClipart
            type={clipartType}
            size={size === 'xl' || size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
            className="w-full h-full border-0 bg-transparent text-slate-700"
          />
        </div>
      )}

      {/* Overlay indicator for custom photo or animated GIF */}
      {hasValidCustomImage && (
        <div className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-0.5 pointer-events-none opacity-85">
          {isGif ? (
            <span className="tracking-wider">GIF</span>
          ) : (
            <ImageIcon className="h-2.5 w-2.5" />
          )}
        </div>
      )}

      {/* Hover prompt if clickable */}
      {onClick && showZoomOnHover && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 shadow-xs">
            Edit
          </span>
        </div>
      )}
    </div>
  );
};
