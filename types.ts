
export interface DownloadLink {
  quality: string; // Used as the Button Text (e.g., "Download Link" or "720p")
  size: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  slug?: string; // SEO Friendly URL part - Optional for backward compatibility
  poster: string;
  screenshots: string[];
  category: string[]; // Changed to Array for Multi-select
  genres: string[]; 
  year: string;
  language: string;
  description: string;
  trailerUrl: string;
  qualityTag: string; 
  downloadLinks: DownloadLink[];
  addedAt: number; 
  isTrending?: boolean;
  trendingPoster?: string; 
  seoTags?: string; 
  downloadCount?: number; // New stat tracking
}

export const CATEGORY_LIST = ['Bollywood', 'Hollywood', 'South', 'Web Series', 'Dual Audio', '18+', 'Tv Show', 'K-Drama', 'Anime'];

export const MOVIES_PER_PAGE = 36;

export interface SiteConfig {
  howToDownloadUrl: string;
  telegramUrl: string;
}

export interface MovieRequest {
  id: string;
  movieName: string;
  timestamp: number;
}
