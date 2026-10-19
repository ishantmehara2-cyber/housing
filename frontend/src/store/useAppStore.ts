import { create } from 'zustand';

interface AppState {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCity: '',
  setSelectedCity: (city) => set({ selectedCity: city }),
  isAuthModalOpen: false,
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
}));
