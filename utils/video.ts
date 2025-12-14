export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Robust regex for YouTube Video ID
  // Supports:
  // - Standard: youtube.com/watch?v=ID
  // - Short: youtu.be/ID
  // - Embed: youtube.com/embed/ID
  // - Shorts: youtube.com/shorts/ID
  // - Mobile: m.youtube.com/...
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    // Using youtube-nocookie often bypasses restrictive embed policies (Error 153)
    // Removed 'origin' parameter as it can cause configuration errors if not strictly whitelisted
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  }
  
  return null;
};