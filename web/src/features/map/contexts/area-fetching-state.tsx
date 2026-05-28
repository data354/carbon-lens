"use client";

import { createContext, use, useState } from "react";

type Param = "area" | "date";
type AreaFetchingStatus = "pending" | "success" | "error";
type AreaFetchingState = Record<Param, AreaFetchingStatus>;

interface IAreaFetchingStateContext {
  state: AreaFetchingState;
  setState: React.Dispatch<
    React.SetStateAction<AreaFetchingState>
  >;
}

const AreaFetchingStateContext =
  createContext<IAreaFetchingStateContext | null>(null);

export function AreaFetchingStateProvider({
  initialState = {
    area: "pending",
    date: "pending",
  },
  children,
}: React.PropsWithChildren<{
  initialState?: AreaFetchingState;
}>) {
  const [state, setState] =
    useState<AreaFetchingState>(initialState);

  return (
    <AreaFetchingStateContext
      value={{
        state,
        setState,
      }}
    >
      {children}
    </AreaFetchingStateContext>
  );
}

export function useAreaFetchingState() {
  const ctx = use(AreaFetchingStateContext);

  if (!ctx) {
    throw new Error(
      "useAreaFetchingState must be used within an AreaFetchingStateProvider",
    );
  }

  return ctx;
}
