"use client";

import * as React from "react";

/* "" on build.<domain>, "/build" on the main domain. Every builder link goes through this. */
const BaseContext = React.createContext("/build");
export const useBase = () => React.useContext(BaseContext);

export function BaseProvider({ base, children }: { base: string; children: React.ReactNode }) {
  return <BaseContext.Provider value={base}>{children}</BaseContext.Provider>;
}
