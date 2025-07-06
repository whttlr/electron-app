/**
 * Accessibility Enhancements for Touch Interfaces
 *
 * Comprehensive accessibility improvements for CNC control interfaces,
 * focusing on touch accessibility, screen readers, high contrast modes,
 * and industrial environment considerations.
 */

import React, {
  useEffect, useCallback, useRef, useState,
} from 'react';

// Accessibility configuration
export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableScreenReader: boolean;
  enableVoiceAnnouncements: boolean;
  enableHapticFeedback: boolean;
  enableFocusTrapping: boolean;
  enableKeyboardNavigation: boolean;
  touchTargetMinSize: number;
  colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
}

export const defaultAccessibilityConfig: AccessibilityConfig = {
  enableHighContrast: false,
  enableLargeText: false,
  enableScreenReader: true,
  enableVoiceAnnouncements: false,
  enableHapticFeedback: true,
  enableFocusTrapping: true,
  enableKeyboardNavigation: true,
  touchTargetMinSize: 44,
  colorBlindnessSupport: 'none',
  reducedMotion: false,
};

// ARIA live region manager
export class AriaLiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createDefaultRegions();
  }

  private createDefaultRegions(): void {
    const regions = [
      { id: 'cnc-announcements', priority: 'polite' },
      { id: 'cnc-alerts', priority: 'assertive' },
      { id: 'cnc-status', priority: 'polite' },
    ];

    regions.forEach(({ id, priority }) => {
      const element = document.createElement('div');
      element.id = id;
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(element);
      this.regions.set(id, element);
    });
  }

  announce(message: string, region = 'cnc-announcements'): void {
    const element = this.regions.get(region);
    if (element) {
      element.textContent = message;

      // Clear after announcement to allow repeat announcements
      setTimeout(() => {
        element.textContent = '';
      }, 1000);
    }
  }

  announceAlert(message: string): void {
    this.announce(message, 'cnc-alerts');
  }

  announceStatus(message: string): void {
    this.announce(message, 'cnc-status');
  }

  cleanup(): void {
    this.regions.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.regions.clear();
  }
}

// Voice synthesis manager for industrial environments
export class VoiceAnnouncementManager {
  private synthesis: SpeechSynthesis | null = null;

  private voice: SpeechSynthesisVoice | null = null;

  private enabled = false;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    const setVoice = () => {
      const voices = this.synthesis!.getVoices();
      // Prefer clear, robotic voices for industrial environments
      this.voice = voices.find((voice) => voice.name.toLowerCase().includes('robotic')
        || voice.name.toLowerCase().includes('alex')
        || voice.name.toLowerCase().includes('daniel')) || voices[0] || null;
    };

    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.synthesis.onvoiceschanged = setVoice;
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
    this.stop();
  }

  speak(text: string, options: {
    priority?: 'low' | 'medium' | 'high';
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}): void {
    if (!this.enabled || !this.synthesis || !this.voice) return;

    const {
      priority = 'medium',
      rate = 0.9, // Slightly slower for clarity in noisy environments
      pitch = 1.0,
      volume = 0.8,
    } = options;

    // Stop current speech for high priority announcements
    if (priority === 'high') {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Add error handling
    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  announcePosition(x: number, y: number, z: number, units: string): void {
    const text = `Position: X ${x.toFixed(2)}, Y ${y.toFixed(2)}, Z ${z.toFixed(2)} ${units}`;
    this.speak(text, { priority: 'low' });
  }

  announceAlert(message: string): void {
    this.speak(`Alert: ${message}`, { priority: 'high', rate: 0.8 });
  }

  announceStatus(status: string): void {
    this.speak(`Status: ${status}`, { priority: 'medium' });
  }

  announceAction(action: string): void {
    this.speak(action, { priority: 'low', rate: 1.1 });
  }
}

// Focus management for modal dialogs and complex interfaces
export class FocusTrapManager {
  private activeTraps: Map<string, {
    container: HTMLElement;
    previousFocus: HTMLElement | null;
    focusableElements: HTMLElement[];
  }> = new Map();

  trapFocus(containerId: string, container: HTMLElement): void {
    const previousFocus = document.activeElement as HTMLElement;
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length === 0) return;

    this.activeTraps.set(containerId, {
      container,
      previousFocus,
      focusableElements,
    });

    // Focus first element
    focusableElements[0].focus();

    // Add event listeners
    container.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('focusin', this.handleFocusIn);
  }

  releaseFocus(containerId: string): void {
    const trap = this.activeTraps.get(containerId);
    if (!trap) return;

    // Remove event listeners
    trap.container.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focusin', this.handleFocusIn);

    // Restore previous focus
    if (trap.previousFocus) {
      trap.previousFocus.focus();
    }

    this.activeTraps.delete(containerId);
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
    ].join(',');

    return Array.from(container.querySelectorAll(selectors)) as HTMLElement[];
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const activeTrap = Array.from(this.activeTraps.values())[0];
    if (!activeTrap) return;

    const { focusableElements } = activeTrap;
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (event.shiftKey) {
      // Shift + Tab (previous element)
      const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      focusableElements[nextIndex].focus();
    } else {
      // Tab (next element)
      const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
      focusableElements[nextIndex].focus();
    }

    event.preventDefault();
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const activeTrap = Array.from(this.activeTraps.values())[0];
    if (!activeTrap) return;

    const { container, focusableElements } = activeTrap;
    const target = event.target as HTMLElement;

    if (!container.contains(target)) {
      // Focus escaped the trap, bring it back
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  };
}

// High contrast mode manager
export class HighContrastManager {
  private enabled = false;

  private customStyles: HTMLStyleElement | null = null;

  enable(): void {
    if (this.enabled) return;

    this.enabled = true;
    this.applyHighContrastStyles();
    document.documentElement.setAttribute('data-high-contrast', 'true');
  }

  disable(): void {
    if (!this.enabled) return;

    this.enabled = false;
    this.removeHighContrastStyles();
    document.documentElement.removeAttribute('data-high-contrast');
  }

  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  private applyHighContrastStyles(): void {
    if (this.customStyles) return;

    this.customStyles = document.createElement('style');
    this.customStyles.textContent = `
      [data-high-contrast="true"] {
        --bg-primary: #000000 !important;
        --bg-secondary: #000000 !important;
        --text-primary: #ffffff !important;
        --text-secondary: #ffffff !important;
        --border-color: #ffffff !important;
        --accent-color: #ffff00 !important;
        --error-color: #ff0000 !important;
        --success-color: #00ff00 !important;
        --warning-color: #ffff00 !important;
      }

      [data-high-contrast="true"] * {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
      }

      [data-high-contrast="true"] button,
      [data-high-contrast="true"] input,
      [data-high-contrast="true"] select {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border: 2px solid var(--border-color) !important;
      }

      [data-high-contrast="true"] button:hover,
      [data-high-contrast="true"] button:focus {
        background-color: var(--accent-color) !important;
        color: var(--bg-primary) !important;
      }

      [data-high-contrast="true"] .error {
        color: var(--error-color) !important;
      }

      [data-high-contrast="true"] .success {
        color: var(--success-color) !important;
      }

      [data-high-contrast="true"] .warning {
        color: var(--warning-color) !important;
      }

      [data-high-contrast="true"] img,
      [data-high-contrast="true"] svg {
        filter: contrast(1000%) !important;
      }
    `;

    document.head.appendChild(this.customStyles);
  }

  private removeHighContrastStyles(): void {
    if (this.customStyles) {
      document.head.removeChild(this.customStyles);
      this.customStyles = null;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Color blindness filter manager
export class ColorBlindnessFilterManager {
  private currentFilter: string = 'none';

  private filterStyles: HTMLStyleElement | null = null;

  setFilter(type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'): void {
    this.currentFilter = type;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.removeFilter();

    if (this.currentFilter === 'none') return;

    this.filterStyles = document.createElement('style');

    const filters = {
      protanopia: 'sepia(100%) saturate(150%) hue-rotate(320deg)',
      deuteranopia: 'sepia(100%) saturate(150%) hue-rotate(60deg)',
      tritanopia: 'sepia(100%) saturate(150%) hue-rotate(180deg)',
    };

    this.filterStyles.textContent = `
      [data-colorblind-filter="${this.currentFilter}"] *:not(.colorblind-exempt) {
        filter: ${filters[this.currentFilter as keyof typeof filters]} !important;
      }
    `;

    document.head.appendChild(this.filterStyles);
    document.documentElement.setAttribute('data-colorblind-filter', this.currentFilter);
  }

  private removeFilter(): void {
    if (this.filterStyles) {
      document.head.removeChild(this.filterStyles);
      this.filterStyles = null;
    }
    document.documentElement.removeAttribute('data-colorblind-filter');
  }

  getCurrentFilter(): string {
    return this.currentFilter;
  }
}

// React hooks for accessibility features
export const useAccessibilityAnnouncements = () => {
  const ariaManagerRef = useRef<AriaLiveRegionManager | null>(null);
  const voiceManagerRef = useRef<VoiceAnnouncementManager | null>(null);

  useEffect(() => {
    ariaManagerRef.current = new AriaLiveRegionManager();
    voiceManagerRef.current = new VoiceAnnouncementManager();

    return () => {
      ariaManagerRef.current?.cleanup();
    };
  }, []);

  const announce = useCallback((message: string, useVoice = false) => {
    ariaManagerRef.current?.announce(message);
    if (useVoice) {
      voiceManagerRef.current?.speak(message);
    }
  }, []);

  const announceAlert = useCallback((message: string, useVoice = true) => {
    ariaManagerRef.current?.announceAlert(message);
    if (useVoice) {
      voiceManagerRef.current?.announceAlert(message);
    }
  }, []);

  const announceStatus = useCallback((message: string, useVoice = false) => {
    ariaManagerRef.current?.announceStatus(message);
    if (useVoice) {
      voiceManagerRef.current?.announceStatus(message);
    }
  }, []);

  const enableVoice = useCallback(() => {
    voiceManagerRef.current?.enable();
  }, []);

  const disableVoice = useCallback(() => {
    voiceManagerRef.current?.disable();
  }, []);

  return {
    announce,
    announceAlert,
    announceStatus,
    enableVoice,
    disableVoice,
  };
};

export const useFocusTrap = (containerId: string, enabled = true) => {
  const focusTrapRef = useRef<FocusTrapManager | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    focusTrapRef.current = new FocusTrapManager();
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    containerRef.current = container;
    if (enabled && focusTrapRef.current) {
      focusTrapRef.current.trapFocus(containerId, container);
    }
  }, [containerId, enabled]);

  const releaseFocus = useCallback(() => {
    if (focusTrapRef.current) {
      focusTrapRef.current.releaseFocus(containerId);
    }
  }, [containerId]);

  useEffect(() => () => {
    releaseFocus();
  }, [releaseFocus]);

  return { trapFocus, releaseFocus };
};

export const useHighContrast = () => {
  const [enabled, setEnabled] = useState(false);
  const managerRef = useRef<HighContrastManager | null>(null);

  useEffect(() => {
    managerRef.current = new HighContrastManager();
  }, []);

  const toggle = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.toggle();
      setEnabled(managerRef.current.isEnabled());
    }
  }, []);

  const enable = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.enable();
      setEnabled(true);
    }
  }, []);

  const disable = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disable();
      setEnabled(false);
    }
  }, []);

  return {
    enabled, toggle, enable, disable,
  };
};

export const useColorBlindnessFilter = () => {
  const [currentFilter, setCurrentFilter] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  const managerRef = useRef<ColorBlindnessFilterManager | null>(null);

  useEffect(() => {
    managerRef.current = new ColorBlindnessFilterManager();
  }, []);

  const setFilter = useCallback((filter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    if (managerRef.current) {
      managerRef.current.setFilter(filter);
      setCurrentFilter(filter);
    }
  }, []);

  return { currentFilter, setFilter };
};

export const useAccessibilityConfig = (initialConfig: Partial<AccessibilityConfig> = {}) => {
  const [config, setConfig] = useState<AccessibilityConfig>({
    ...defaultAccessibilityConfig,
    ...initialConfig,
  });

  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Apply system preferences
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const handleMediaChange = () => {
      updateConfig({
        reducedMotion: mediaQueries.reducedMotion.matches,
        enableHighContrast: mediaQueries.highContrast.matches,
      });
    };

    Object.values(mediaQueries).forEach((mq) => {
      mq.addEventListener('change', handleMediaChange);
    });

    handleMediaChange();

    return () => {
      Object.values(mediaQueries).forEach((mq) => {
        mq.removeEventListener('change', handleMediaChange);
      });
    };
  }, [updateConfig]);

  return { config, updateConfig };
};

// Export singleton instances
export const ariaLiveManager = new AriaLiveRegionManager();
export const voiceManager = new VoiceAnnouncementManager();
export const focusTrapManager = new FocusTrapManager();
export const highContrastManager = new HighContrastManager();
export const colorBlindnessManager = new ColorBlindnessFilterManager();

export default {
  AriaLiveRegionManager,
  VoiceAnnouncementManager,
  FocusTrapManager,
  HighContrastManager,
  ColorBlindnessFilterManager,
  useAccessibilityAnnouncements,
  useFocusTrap,
  useHighContrast,
  useColorBlindnessFilter,
  useAccessibilityConfig,
  ariaLiveManager,
  voiceManager,
  focusTrapManager,
  highContrastManager,
  colorBlindnessManager,
};
