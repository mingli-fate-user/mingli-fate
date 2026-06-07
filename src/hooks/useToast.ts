import { useState, useCallback } from 'react';

interface Toast {
  message: string;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<Toast>({ message: '', visible: false });

  const showToast = useCallback((message: string, duration = 2000) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, duration);
  }, []);

  return { toast, showToast };
}
