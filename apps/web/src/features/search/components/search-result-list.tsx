"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface SearchResultListProps {
  data: string[];
  containerClassName?: string;
  onItemClick: (item: string) => void;
}

export function SearchResultList({
  data,
  containerClassName,
  onItemClick,
}: SearchResultListProps) {
  const groupedResults = data.reduce<
    Record<string, string[]>
  >((groups, item) => {
    const firstLetter = item.charAt(0);

    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }

    groups[firstLetter].push(item);
    return groups;
  }, {});

  const resultsByFirstLetter = Object.entries(
    groupedResults,
  ).map(([firstLetter, list]) => ({
    firstLetter,
    data: list,
  }));

  useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const activeEl = document.activeElement;

          if (
            activeEl &&
            activeEl instanceof HTMLElement &&
            activeEl.tagName === "LI"
          ) {
            activeEl.click();
          }
        }
      },
      {
        signal: abortController.signal,
      },
    );

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div
      className={cn(
        "space-y-6 pt-1 pb-5",
        containerClassName,
      )}
    >
      {resultsByFirstLetter.map(({ firstLetter, data }) => {
        if (!data || data.length === 0) {
          return null;
        }

        return (
          <div
            key={firstLetter}
            className="relative"
          >
            <h3 className="sticky top-0 bg-white/80 px-4 py-px text-sm font-medium text-zinc-400 backdrop-blur-sm">
              {firstLetter}
            </h3>
            <ul className="space-y-1 px-4">
              {data.map((item) => (
                <li
                  key={item}
                  tabIndex={0}
                  role="button"
                  className="block cursor-pointer text-sm hover:underline"
                  onClick={() => onItemClick(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
