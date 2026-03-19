import { useEffect, useCallback } from 'react';
import type { ModuleId } from '../App';

interface KeyboardRouterProps {
  onNavigate: (module: ModuleId) => void;
  onShowShortcuts: () => void;
  onEscape: () => void;
}

export function KeyboardRouter({ onNavigate, onShowShortcuts, onEscape }: KeyboardRouterProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Input guard — check if user is typing in an editable field
    const target = e.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.tagName === 'SELECT'
      || target.isContentEditable;

    // Module switching — Alt+1-4 (always active, even in inputs)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      switch (e.key) {
        case '1': e.preventDefault(); onNavigate('dashboard'); return;
        case '2': e.preventDefault(); onNavigate('habits'); return;
        case '3': e.preventDefault(); onNavigate('planner'); return;
        case '4': e.preventDefault(); onNavigate('expenses'); return;
      }
    }

    // Escape — always works, even in inputs
    if (e.key === 'Escape' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onEscape();
      return;
    }

    // Shortcuts that are disabled when editing
    if (!isEditing && !e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '?') {
        e.preventDefault();
        onShowShortcuts();
        return;
      }
    }
  }, [onNavigate, onShowShortcuts, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // Pure behavior component — no UI
}
