import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((type, message) => {
    const id = Date.now();

    // Add new notification
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Notification container (bottom-right corner) */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            role="alert"
            className={`transition-opacity duration-300 px-4 py-2 rounded shadow text-white ${
              n.type === 'success'
                ? 'bg-green-500'
                : n.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};