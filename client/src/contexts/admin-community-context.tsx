import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminCommunityContextType {
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
}

const AdminCommunityContext = createContext<AdminCommunityContextType>({
  selectedCommunityId: null,
  setSelectedCommunityId: () => {},
});

const STORAGE_KEY = 'admin-selected-community';

export function AdminCommunityProvider({ children }: { children: ReactNode }) {
  const [selectedCommunityId, setSelectedCommunityIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setSelectedCommunityId = (id: string | null) => {
    setSelectedCommunityIdState(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <AdminCommunityContext.Provider value={{ selectedCommunityId, setSelectedCommunityId }}>
      {children}
    </AdminCommunityContext.Provider>
  );
}

export function useAdminCommunity() {
  return useContext(AdminCommunityContext);
}
