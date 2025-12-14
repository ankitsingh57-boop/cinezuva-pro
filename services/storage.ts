
import { supabase } from '../lib/supabase';
import { Movie, SiteConfig, MovieRequest } from '../types';

// --- HELPERS ---

export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// --- MOVIES SERVICE ---

export const getMovies = async (): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    // Use quoted identifiers for case-sensitive columns defined in SQL
    .order('"addedAt"', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error.message || error);
    return [];
  }
  
  return data as Movie[];
};

export const addMovie = async (movie: Movie) => {
  // Ensure slug exists in the payload
  const payload = { ...movie };
  if (!payload.slug) {
    payload.slug = createSlug(payload.title);
  }
  
  // Attempt 1: Insert with slug
  const { error } = await supabase.from('movies').insert([payload]);
  
  if (error) {
    // If error implies column missing, retry without it
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('slug') && (msg.includes('column') || msg.includes('schema'))) {
       console.warn("Slug column missing in DB, retrying without slug...");
       const { slug, ...fallbackPayload } = payload;
       const retry = await supabase.from('movies').insert([fallbackPayload]);
       if (retry.error) {
           console.error('Error adding movie (retry):', retry.error.message);
           return false;
       }
       return true;
    }
    
    console.error('Error adding movie:', error.message);
    return false;
  }
  return true;
};

export const updateMovie = async (updatedMovie: Movie) => {
  const payload = { ...updatedMovie };
  if (!payload.slug) {
    payload.slug = createSlug(payload.title);
  }

  // Attempt 1: Update with slug
  const { error } = await supabase
    .from('movies')
    .update(payload)
    .eq('id', payload.id);
  
  if (error) {
    // If error implies column missing, retry without it
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('slug') && (msg.includes('column') || msg.includes('schema'))) {
       console.warn("Slug column missing in DB, retrying update without slug...");
       const { slug, ...fallbackPayload } = payload;
       const retry = await supabase.from('movies').update(fallbackPayload).eq('id', payload.id);
       if (retry.error) {
           console.error('Error updating movie (retry):', retry.error.message);
           return false;
       }
       return true;
    }
  
    console.error('Error updating movie:', error.message);
    return false;
  }
  return true;
};

export const deleteMovie = async (id: string) => {
  const { error } = await supabase.from('movies').delete().eq('id', id);
  if (error) console.error('Error deleting movie:', error.message);
  return !error;
};

export const getMovieById = async (id: string): Promise<Movie | undefined> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return data as Movie;
};

// NEW: Fetch by Slug for SEO URLs
export const getMovieBySlug = async (slug: string): Promise<Movie | undefined> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return undefined;
  return data as Movie;
};

export const getRelatedMovies = async (categories: string[], currentId: string): Promise<Movie[]> => {
  if (categories.length === 0) return [];

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .neq('id', currentId)
    .limit(10); 

  if (error || !data) return [];
  
  const movies = data as Movie[];
  return movies.filter(m => m.category.some(c => categories.includes(c))).slice(0, 6);
};

export const incrementDownloadCount = async (id: string) => {
  const { data } = await supabase.from('movies').select('"downloadCount"').eq('id', id).single();
  const current = data?.downloadCount || 0;
  
  await supabase
    .from('movies')
    .update({ downloadCount: current + 1 })
    .eq('id', id);
};

// --- CONFIG SERVICE ---

export const getSiteConfig = async (): Promise<SiteConfig> => {
  const { data, error } = await supabase.from('site_config').select('*').limit(1).single();
  if (error || !data) return { howToDownloadUrl: '', telegramUrl: '' };
  return data as SiteConfig;
};

export const saveSiteConfig = async (config: SiteConfig) => {
  try {
      const { data, error: fetchError } = await supabase.from('site_config').select('id').limit(1);
      
      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows" error
          console.error("Error fetching config for save:", fetchError);
      }

      const payload = {
          howToDownloadUrl: config.howToDownloadUrl,
          telegramUrl: config.telegramUrl
      };

      if (data && data.length > 0) {
        const { error } = await supabase.from('site_config').update(payload).eq('id', data[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert([payload]);
        if (error) throw error;
      }
      return true;
  } catch (error) {
      console.error("Error saving config:", error);
      return false;
  }
};

// --- REQUESTS SERVICE ---

export const getRequests = async (): Promise<MovieRequest[]> => {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) return [];
  return data as MovieRequest[];
};

export const addRequest = async (name: string) => {
  const newReq: MovieRequest = { id: Date.now().toString(), movieName: name, timestamp: Date.now() };
  await supabase.from('requests').insert([newReq]);
};

export const deleteRequest = async (id: string) => {
  await supabase.from('requests').delete().eq('id', id);
};
