import { supabase } from '../lib/supabase';

// Check if user is logged in (persisted in session storage)
export const isAuthenticated = (): boolean => {
  return sessionStorage.getItem('cinezuva_admin') === 'true';
};

// Login function checking Supabase table
export const login = async (email: string, pass: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', pass) // Direct comparison as requested
      .single();

    if (error || !data) {
      return false;
    }

    // Login Successful
    sessionStorage.setItem('cinezuva_admin', 'true');
    return true;
  } catch (e) {
    console.error("Login error", e);
    return false;
  }
};

export const logout = () => {
  sessionStorage.removeItem('cinezuva_admin');
  window.location.reload();
};