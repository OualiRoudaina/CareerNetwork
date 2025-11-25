import { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

export default function Alert({ message, type, onClose, duration = 5000 }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${bgColors[type]} border px-4 py-3 rounded relative mb-4 transition-opacity duration-300`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <button onClick={onClose} className="font-semibold">
            ×
          </button>
        </span>
      )}
    </div>
  );
}

