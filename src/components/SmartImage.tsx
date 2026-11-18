import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SmartImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 p-4 text-center ${className}`}
        aria-label={alt}
      >
        <ImageOff className="w-6 h-6 mb-1.5 opacity-70" />
        {fallbackLabel && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
