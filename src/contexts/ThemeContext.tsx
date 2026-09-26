import React, { createContext, useContext, useState, useEffect } from 'react';

export type SkinType = 'modern' | 'vintage-kenner' | 'retro-neon';
export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  skin: SkinType;
  setSkin: (skin: SkinType) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skin, setSkinState] = useState<SkinType>(() => {
    const savedSkin = localStorage.getItem('cb_skin') as SkinType | null;
    if (savedSkin && ['modern', 'vintage-kenner', 'retro-neon'].includes(savedSkin)) {
      return savedSkin;
    }
    return 'vintage-kenner'; // Default to iconic 80s Kenner Cardback vibe
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('cb_theme') as ThemeMode | null;
    if (savedMode && ['dark', 'light'].includes(savedMode)) {
      return savedMode;
    }
    return 'dark'; // Dark theme default for collector aesthetic
  });

  const setSkin = (newSkin: SkinType) => {
    setSkinState(newSkin);
    localStorage.setItem('cb_skin', newSkin);
    document.documentElement.setAttribute('data-skin', newSkin);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('cb_theme', newMode);
    applyModeToDoc(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const applyModeToDoc = (m: ThemeMode) => {
    const root = document.documentElement;
    if (m === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    applyModeToDoc(mode);
  }, [skin, mode]);

  return (
    <ThemeContext.Provider value={{ skin, setSkin, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
