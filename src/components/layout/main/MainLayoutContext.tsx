"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MainLayoutContextValue = {
  sidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const MainLayoutContext = createContext<MainLayoutContextValue | null>(null);

export function MainLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({
      sidebarOpen,
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen((current) => !current),
    }),
    [sidebarOpen],
  );

  return (
    <MainLayoutContext.Provider value={value}>
      {children}
    </MainLayoutContext.Provider>
  );
}

export function useMainLayout() {
  const context = useContext(MainLayoutContext);

  if (!context) {
    throw new Error("useMainLayout must be used within MainLayoutProvider");
  }

  return context;
}
