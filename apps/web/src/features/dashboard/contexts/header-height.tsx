"use client";

import { createContext, use, useState } from "react";

interface IHeaderHeightContext {
  height: number;
  setHeight: (height: number) => void;
}

const HeaderHeightContext =
  createContext<IHeaderHeightContext | null>(null);

export function HeaderHeightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [height, setHeight] = useState(0);

  return (
    <HeaderHeightContext value={{ height, setHeight }}>
      {children}
    </HeaderHeightContext>
  );
}

export function useHeaderHeight() {
  const ctx = use(HeaderHeightContext);

  if (!ctx) {
    throw new Error(
      "useHeaderHeight must be used within a HeaderHeightProvider",
    );
  }

  return ctx;
}
