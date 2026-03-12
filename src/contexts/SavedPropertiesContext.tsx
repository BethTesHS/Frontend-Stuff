import { createContext, useContext, useState, ReactNode } from 'react';
import { Property } from '@/types';
import { Room } from '@/types/room';

interface SavedPropertiesContextType {
  // Properties
  savedProperties: Property[];
  addSavedProperty: (property: Property) => void;
  removeSavedProperty: (propertyId: string) => void;
  isPropertySaved: (propertyId: string) => boolean;

  // Rooms
  savedRooms: Room[];
  addSavedRoom: (room: Room) => void;
  removeSavedRoom: (roomId: string) => void;
  isRoomSaved: (roomId: string) => boolean;
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

  // Room State
  const [savedRooms, setSavedRooms] = useState<Room[]>(() => {
    const stored = localStorage.getItem('savedRooms');
    return stored ? JSON.parse(stored) : [];
  });

  const addSavedRoom = (room: Room) => {
    setSavedRooms(prev => {
      if (prev.some(r => r.id === room.id)) return prev;
      const updated = [...prev, room];
      localStorage.setItem('savedRooms', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedRoom = (roomId: string) => {
    setSavedRooms(prev => {
      const updated = prev.filter(r => r.id !== roomId);
      localStorage.setItem('savedRooms', JSON.stringify(updated));
      return updated;
    });
  };

  const isRoomSaved = (roomId: string) => {
    return savedRooms.some(r => r.id === roomId);
  };

  const value = {
    savedProperties,
    addSavedProperty,
    removeSavedProperty,
    isPropertySaved,
    savedRooms,
    addSavedRoom,
    removeSavedRoom,
    isRoomSaved,
  };

  return (
    <SavedPropertiesContext.Provider value={value}>
      {children}
    </SavedPropertiesContext.Provider>
  );
};
