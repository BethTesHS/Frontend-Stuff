
import { createContext, useContext, useState, ReactNode } from 'react';
import { Property } from '@/types';

interface SavedPropertiesContextType {
  savedProperties: Property[];
  addSavedProperty: (property: Property) => void;
  removeSavedProperty: (propertyId: string) => void;
  isPropertySaved: (propertyId: string) => boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};

interface SavedPropertiesProviderProps {
  children: ReactNode;
}

export const SavedPropertiesProvider = ({ children }: SavedPropertiesProviderProps) => {
  const [savedProperties, setSavedProperties] = useState<Property[]>(() => {
    const stored = localStorage.getItem('savedProperties');
    return stored ? JSON.parse(stored) : [];
  });

  const addSavedProperty = (property: Property) => {
    setSavedProperties(prev => {
      // Check if property is already saved
      if (prev.some(p => p.id === property.id)) {
        return prev;
      }
      const updated = [...prev, property];
      localStorage.setItem('savedProperties', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedProperty = (propertyId: string) => {
    setSavedProperties(prev => {
      const updated = prev.filter(p => p.id !== propertyId);
      localStorage.setItem('savedProperties', JSON.stringify(updated));
      return updated;
    });
  };

  const isPropertySaved = (propertyId: string) => {
    return savedProperties.some(p => p.id === propertyId);
  };

  const value = {
    savedProperties,
    addSavedProperty,
    removeSavedProperty,
    isPropertySaved,
  };

  return (
    <SavedPropertiesContext.Provider value={value}>
      {children}
    </SavedPropertiesContext.Provider>
  );
};
