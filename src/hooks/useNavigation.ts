"use client";

import { useRouter } from "next/navigation";

export function useNavigation() {
  const router = useRouter();

  const goToRoute = (url: string) => {
    router.push(url);
  };

  const goToRouteWithParams = (url: string, params: object) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    router.push(`${url}?${queryString}`);
  };

  return { goToRoute, goToRouteWithParams };
}
