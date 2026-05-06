import { useEffect, useCallback } from 'react';
import type { ModuleId } from '../App';

interface KeyboardRouterProps {
  onNavigate: (module: ModuleId) => void;
  onShowShortcuts: () => void;
  onEscape: () => void;
  activeModule: ModuleId;
  onNewItem: () => void;
  onNavigateDay?: (direction: -1 | 1) => void;
  onGoToToday?: () => void;
  onCommandPalette: () => void;
  onLogMeal: () => void;
}

export function KeyboardRouter({
  onNavigate,
  onShowShortcuts,
  onEscape,
  activeModule,
  onNewItem,
  onNavigateDay,
  onGoToToday,
  onCommandPalette,
  onLogMeal,
}: KeyboardRouterProps) {
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
        case '5': e.preventDefault(); onNavigate('food'); return;
      }
    }

    // Ctrl+K — command palette (always active, even in inputs)
    if (e.ctrlKey && !e.altKey && !e.metaKey && e.key === 'k') {
      e.preventDefault();
      onCommandPalette();
      return;
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

      // "N" — trigger new item for current module
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewItem();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onLogMeal();
        return;
      }

      // Planner day navigation — ArrowLeft / ArrowRight
      if (e.key === 'ArrowLeft' && activeModule === 'planner') {
        e.preventDefault();
        onNavigateDay?.(-1);
        return;
      }

      if (e.key === 'ArrowRight' && activeModule === 'planner') {
        e.preventDefault();
        onNavigateDay?.(1);
        return;
      }

      // Planner jump to today — T key
      if ((e.key === 't' || e.key === 'T') && activeModule === 'planner') {
        e.preventDefault();
        onGoToToday?.();
        return;
      }
    }
  }, [onNavigate, onShowShortcuts, onEscape, onNewItem, activeModule, onNavigateDay, onGoToToday, onCommandPalette, onLogMeal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // Pure behavior component — no UI
}
