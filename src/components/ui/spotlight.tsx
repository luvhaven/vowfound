"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A surface that carries a soft light under the cursor.
 *
 * Writes two CSS variables and nothing else, so it costs no re-render, and a
 * touch device or a visitor without JavaScript simply sees the still card.
 */
export function Spotlight({
  as: Comp = "div",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "article" | "li" }) {
  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <Comp className={cn("spotlight", className)} onPointerMove={onPointerMove} {...props}>
      {children}
    </Comp>
  );
}
