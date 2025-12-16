import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCommunityBySlug, type Community } from '@/hooks/use-communities';

interface CommunityContextType {
  selectedCommunity: Community | null;
  isLoading: boolean;
  communitySlug: string | null;
  setSelectedCommunity: (community: Community | null) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Extrair slug do subdomínio
function extractSlugFromHostname(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;
  
  // Remover porta se existir
  const hostWithoutPort = hostname.split(':')[0];
  
  // Se for localhost ou IP, tentar pegar do localStorage
  if (hostWithoutPort === 'localhost' || hostWithoutPort.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return localStorage.getItem('selectedCommunity') || null;
  }
  
  // Extrair subdomínio (ex: zona.app.com -> zona)
  const parts = hostWithoutPort.split('.');
  
  // Se tiver mais de 2 partes, o primeiro é o subdomínio
  if (parts.length > 2) {
    return parts[0];
  }
  
  // Se não tiver subdomínio, retorna null (domínio principal)
  return null;
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [communitySlug, setCommunitySlug] = useState<string | null>(() => {
    return extractSlugFromHostname();
  });

  const { data: community, isLoading } = useCommunityBySlug(communitySlug);
  const [selectedCommunity, setSelectedCommunityState] = useState<Community | null>(null);

  // Atualizar comunidade quando dados carregarem
  useEffect(() => {
    if (community) {
      setSelectedCommunityState(community);
      // Salvar no localStorage para desenvolvimento local
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCommunity', community.slug);
    }
    } else if (!isLoading && communitySlug) {
      // Se não encontrou comunidade mas tinha slug, limpar
      setSelectedCommunityState(null);
    }
  }, [community, isLoading, communitySlug]);

  // Detectar mudanças no hostname (navegação entre subdomínios)
  useEffect(() => {
    const handleLocationChange = () => {
      const newSlug = extractSlugFromHostname();
      if (newSlug !== communitySlug) {
        setCommunitySlug(newSlug);
      }
    };

    // Verificar mudanças periódicas (para desenvolvimento)
    const interval = setInterval(handleLocationChange, 1000);
    
    return () => clearInterval(interval);
  }, [communitySlug]);

  const setSelectedCommunity = (community: Community | null) => {
    setSelectedCommunityState(community);
    if (community) {
      setCommunitySlug(community.slug);
    if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCommunity', community.slug);
        // Redirecionar para subdomínio se não estiver nele
        const currentSlug = extractSlugFromHostname();
        if (currentSlug !== community.slug && window.location.hostname !== 'localhost') {
          const protocol = window.location.protocol;
          const domain = window.location.hostname.split('.').slice(-2).join('.');
          window.location.href = `${protocol}//${community.slug}.${domain}${window.location.pathname}${window.location.search}`;
        }
      }
    }
  };

  return (
    <CommunityContext.Provider value={{ 
      selectedCommunity, 
      isLoading, 
      communitySlug,
      setSelectedCommunity 
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useSelectedCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useSelectedCommunity must be used within a CommunityProvider');
  }
  return context;
}

