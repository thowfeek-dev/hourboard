import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  taskDialogOpen: boolean;
  selectedTaskId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setTaskDialogOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
}

export const useUiStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  taskDialogOpen: false,
  selectedTaskId: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setTaskDialogOpen: (taskDialogOpen) => set({ taskDialogOpen }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
}));
