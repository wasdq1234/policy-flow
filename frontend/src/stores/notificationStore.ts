import { create } from 'zustand';

interface NotificationState {
  isEnabled: boolean;
  isPermissionGranted: boolean;
  fcmToken: string | null;
  setEnabled: (enabled: boolean) => void;
  setPermissionGranted: (granted: boolean) => void;
  setFcmToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isEnabled: false,
  isPermissionGranted: false,
  fcmToken: null,

  setEnabled: (enabled) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationEnabled', JSON.stringify(enabled));
    }
    set({ isEnabled: enabled });
  },

  setPermissionGranted: (granted) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationPermissionGranted', JSON.stringify(granted));
    }
    set({ isPermissionGranted: granted });
  },

  setFcmToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('fcmToken', token);
      } else {
        localStorage.removeItem('fcmToken');
      }
    }
    set({ fcmToken: token });
  },
}));
