export interface Theme {
  id: string;
  name: string;
  colors: {
    red: string;
    dark: string;
    card: string;
    text: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'netflix',
    name: 'Netflix Red',
    colors: { red: '#e50914', dark: '#0f0f0f', card: '#1a1a1a', text: '#e5e5e5' }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: { red: '#0ea5e9', dark: '#020617', card: '#0f172a', text: '#e2e8f0' }
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    colors: { red: '#10b981', dark: '#022c22', card: '#064e3b', text: '#ecfdf5' }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    colors: { red: '#a855f7', dark: '#0b0518', card: '#1e1b4b', text: '#f3e8ff' }
  },
  {
    id: 'gold',
    name: 'Luxury Gold',
    colors: { red: '#eab308', dark: '#121212', card: '#27272a', text: '#fafafa' }
  }
];

export const applyTheme = (themeId: string) => {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  const root = document.documentElement;
  
  root.style.setProperty('--brand-red', theme.colors.red);
  root.style.setProperty('--brand-dark', theme.colors.dark);
  root.style.setProperty('--brand-card', theme.colors.card);
  root.style.setProperty('--brand-text', theme.colors.text);
  
  localStorage.setItem('cinezuva_theme', themeId);
};

export const getCurrentTheme = (): string => {
  return localStorage.getItem('cinezuva_theme') || 'netflix';
};