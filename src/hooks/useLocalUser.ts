import { useState, useEffect } from 'react';

export interface LocalUser {
  id: string;
  name: string;
  avatar: string | null;
}

export function useLocalUser(): {
  user: LocalUser | null;
  setUser: (user: LocalUser) => void;
  logout: () => void;
  isReady: boolean;
} {
  const [user, setUserState] = useState<LocalUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('community_user');
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem('community_user');
      }
    }
    setIsReady(true);
  }, []);

  function setUser(user: LocalUser) {
    localStorage.setItem('community_user', JSON.stringify(user));
    setUserState(user);
  }

  function logout() {
    localStorage.removeItem('community_user');
    setUserState(null);
  }

  return { user, setUser, logout, isReady };
}
