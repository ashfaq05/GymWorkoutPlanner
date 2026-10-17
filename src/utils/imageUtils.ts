/**
 * Image processing utilities for client-side uploads
 * Preserves animated GIFs in their native animated format
 * Resizes static photos down to a max dimension to ensure lightweight local and cloud storage
 */

export function isGifFile(file: File): boolean {
  return file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
}

export function isGifUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('data:image/gif') ||
    /\.gif(\?.*)?$/i.test(url) ||
    url.includes('giphy.com') ||
    url.includes('tenor.com')
  );
}

export function resizeImageFile(file: File, maxDimension: number = 800, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // For animated GIFs: preserve original file data so all animation frames run continuously
    if (isGifFile(file)) {
      if (file.size > 12 * 1024 * 1024) {
        reject(new Error('GIF file is too large (max 12MB). Please select a smaller GIF.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read GIF file'));
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For static images (JPEG, PNG, WebP): compress to lightweight data URL
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

