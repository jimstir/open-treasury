import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DataModeContextType {
  useLiveData: boolean;
  setUseLiveData: (useLive: boolean) => void;
  toggleDataMode: () => void;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

interface DataModeProviderProps {
  children: ReactNode;
}

export const DataModeProvider: React.FC<DataModeProviderProps> = ({ children }) => {
  const [useLiveData, setUseLiveData] = useState<boolean>(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('useLiveData');
    if (savedMode !== null) {
      setUseLiveData(JSON.parse(savedMode));
    }
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('useLiveData', JSON.stringify(useLiveData));
  }, [useLiveData]);

  const toggleDataMode = () => {
    setUseLiveData(prev => !prev);
  };

  const value = {
    useLiveData,
    setUseLiveData,
    toggleDataMode
  };

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = (): DataModeContextType => {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
};
