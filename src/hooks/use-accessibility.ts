'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Keyboard navigation helper
export function useKeyboardNavigation(items: string[], onSelect?: (item: string) => void) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isNavigating) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (onSelect && items[activeIndex]) {
            onSelect(items[activeIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsNavigating(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items, onSelect, isNavigating]);

  return {
    activeIndex,
    setActiveIndex,
    isNavigating,
    setIsNavigating,
  };
}

// Focus management hook
export function useFocusManagement() {
  const focusStack = useRef<HTMLElement[]>([]);

  const pushFocus = useCallback((element: HTMLElement) => {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      focusStack.current.push(currentFocus);
    }
    element.focus();
  }, []);

  const popFocus = useCallback(() => {
    const previousElement = focusStack.current.pop();
    if (previousElement) {
      previousElement.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  return {
    pushFocus,
    popFocus,
    trapFocus,
  };
}

// Announcement hook for screen readers
export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setAnnouncement('');
    
    // Set new announcement after a brief delay to ensure screen readers pick it up
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message);
    }, 100);

    // Clear announcement after a few seconds
    setTimeout(() => {
      setAnnouncement('');
    }, 3000);
  }, []);

  return {
    announcement,
    announce,
  };
}

// Media queries for accessibility preferences
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      });
    };

    updatePreferences();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
}

// Skip to content hook
export function useSkipToContent() {
  const [isVisible, setIsVisible] = useState(false);

  const showSkipLink = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideSkipLink = useCallback(() => {
    setIsVisible(false);
  }, []);

  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    isVisible,
    showSkipLink,
    hideSkipLink,
    skipToMain,
  };
}
