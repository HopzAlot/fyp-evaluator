"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MainLayoutContextValue = {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  closeSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleSidebar: () => void;
};

const MainLayoutContext = createContext<MainLayoutContextValue | null>(null);

export function MainLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      sidebarOpen,
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebarCollapsed: () =>
        setSidebarCollapsed((current) => !current),
      toggleSidebar: () => setSidebarOpen((current) => !current),
    }),
    [sidebarCollapsed, sidebarOpen],
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
