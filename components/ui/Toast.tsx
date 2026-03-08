'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show toast with animation
    requestAnimationFrame(() => {
      setVisible(true);
    });

    // Auto-hide after duration
    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, duration);

    const removeTimeout = setTimeout(() => {
      onClose();
    }, duration + 300);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(removeTimeout);
    };
  }, [duration, onClose]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 
                  type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200';
  
  const textColor = type === 'error' ? 'text-red-800' : 
                    type === 'info' ? 'text-blue-800' :
                    'text-green-800';

  return (
    <div
      className={`${bgColor} border px-4 py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-3 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <p className={`${textColor} flex-1`}>{message}</p>
      <button
        onClick={handleDismiss}
        className={`${textColor} hover:opacity-70 transition-opacity`}
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
