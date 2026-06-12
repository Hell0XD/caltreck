"use client";

import { useContext } from "react";
import { CaltrekContext } from "@/components/caltrek/caltrek-provider";

export function useCaltrek() {
  const context = useContext(CaltrekContext);
  if (!context) {
    throw new Error("useCaltrek must be used inside CaltrekProvider");
  }
  return context;
}
