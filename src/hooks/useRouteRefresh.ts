"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function useRouteRefresh() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const refreshRoute = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return { isRefreshing, refreshRoute };
}
