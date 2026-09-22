'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function AccessibleModal({ isOpen, onClose, titleId, children }: AccessibleModalProps) {
  const portalRoot = typeof document === 'undefined'
    ? null
    : document.getElementById('modal-root');
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !portalRoot) return;

    const opener = document.activeElement as HTMLElement | null;
    const hiddenElements = Array.from(document.body.children).filter(
      (element) => element !== portalRoot,
    ) as HTMLElement[];
    const previousBackgroundState = hiddenElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute('aria-hidden'),
    }));

    hiddenElements.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });

    const focusableElements = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
        .filter((element) => element.offsetParent !== null);

    const firstFocusableElement = focusableElements()[0];
    (firstFocusableElement ?? dialogRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const elements = focusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && (document.activeElement === firstElement || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousBackgroundState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }
      });
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [isOpen, portalRoot]);

  if (!isOpen || !portalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/20 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-[598px]"
      >
        {children}
      </div>
    </div>,
    portalRoot,
  );
}