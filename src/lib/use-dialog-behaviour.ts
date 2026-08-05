"use client";

import * as React from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * The four things an overlay owes a keyboard or screen-reader user.
 *
 * A full-screen menu that merely appears is a trap of a different kind: Tab
 * walks straight out of it into the page behind, which is still there and
 * still scrollable, and Escape does nothing. None of that is visible to
 * someone using a mouse, which is why it survives so long.
 *
 *  1. Focus moves into the panel when it opens.
 *  2. Tab and Shift+Tab cycle within it rather than escaping behind.
 *  3. Escape closes it.
 *  4. Focus returns to whatever opened it, so the reading position is not lost.
 *
 * Scroll locking is handled here too, since a background that scrolls under a
 * fixed panel is the same bug wearing different clothes.
 */
export function useDialogBehaviour({
  open,
  onClose,
  panelRef,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  React.useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const trigger = triggerRef.current;

    // Remembered before focus moves, so it can be handed back on close even if
    // the trigger has since re-rendered.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const { overflow, paddingRight } = document.body.style;
    // Replacing the scrollbar's width stops the page jolting sideways as it
    // locks — a shift that reads as a rendering fault.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null,
      );

    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active && !panel?.contains(active)) {
        // Focus escaped some other way — a click outside, a stray programmatic
        // focus — so bring it back rather than leaving it behind the overlay.
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      (trigger ?? previouslyFocused)?.focus?.();
    };
  }, [open, onClose, panelRef, triggerRef]);
}
