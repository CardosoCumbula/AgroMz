import React, { createContext, useContext, useState } from 'react';

type Language = 'pt' | 'en' | 'sn' | 'zu' | 'ts' | 'nd';

interface SettingsContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  language: Language;
  setLanguage: (val: Language) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  highContrast: false,
  setHighContrast: () => {},
  largeText: false,
  setLargeText: () => {},
  language: 'pt',
  setLanguage: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');

  return (
    <SettingsContext.Provider
      value={{ highContrast, setHighContrast, largeText, setLargeText, language, setLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
