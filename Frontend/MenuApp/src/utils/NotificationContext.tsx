import { createContext, useContext, useState, ReactNode } from "react";

type Notification = {
  id: string;
  message: string;
};

type NotificationContextType = {
  notifications: Notification[];
  pushNotification: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification precisa estar dentro de um NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const pushNotification = (message: string) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, pushNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-green-100 text-green-900 px-4 py-2 rounded shadow transition-opacity duration-300 animate-fade-in"
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
