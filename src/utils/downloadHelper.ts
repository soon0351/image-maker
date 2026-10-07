/**
 * Utility for robust image downloads and clipboard copies across sandboxed iframes and all browsers
 */

export async function downloadImageFile(
  dataUrl: string,
  baseName = 'nano_banana'
): Promise<boolean> {
  if (!dataUrl) return false;

  // Strategy 1: Client-side Blob creation (bypasses iframe data-URL download restrictions)
  try {
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const filename = `${baseName}_${Date.now()}.${ext}`;

      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Check if Chromium showSaveFilePicker is available
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: 'Image',
                accept: { [mimeType]: [`.${ext}`] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return true;
        } catch (pickerErr: any) {
          if (pickerErr.name === 'AbortError') return true; // User cancelled
          // Otherwise continue to fallback
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 2000);
      return true;
    }
  } catch (err) {
    console.warn('Client blob download failed, trying server proxy fallback:', err);
  }

  // Strategy 2: Server-side attachment proxy (always triggers real browser download)
  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename: baseName }),
    });

    if (!res.ok) throw new Error('Server download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${baseName}_${Date.now()}.jpg`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    return true;
  } catch (serverErr) {
    console.error('All download methods failed:', serverErr);
  }

  // Strategy 3: Open in a new tab as ultimate fallback
  try {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<img src="${dataUrl}" style="max-width:100%; height:auto;" />`);
      newTab.document.title = 'Nano Banana Image Preview';
      return true;
    }
  } catch (tabErr) {
    console.error('Failed to open tab:', tabErr);
  }

  return false;
}

export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }

    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    let pngBlob: Blob;
    if (mime === 'image/png') {
      pngBlob = new Blob([u8arr], { type: 'image/png' });
    } else {
      // ClipboardItem typically requires image/png on all OSes
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      pngBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
    }

    await navigator.clipboard.write([
      new window.ClipboardItem({ 'image/png': pngBlob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}
