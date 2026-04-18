import { useEffect, useState } from 'react';
import { FaKeyboard, FaTimes } from 'react-icons/fa';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
  onShortcut?: (key: string) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const KeyboardShortcuts = ({ onShortcut, isOpen, onToggle }: KeyboardShortcutsProps) => {
  const [showHelp, setShowHelp] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isHelpVisible = isOpen !== undefined ? isOpen : showHelp;
  const setHelpVisible = (value: boolean) => {
    if (onToggle) {
      onToggle(value);
    } else {
      setShowHelp(value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setHelpVisible(!isHelpVisible);
        return;
      }

      // Close help with Escape
      if (e.key === 'Escape' && isHelpVisible) {
        setHelpVisible(false);
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Trigger shortcut callback
      if (onShortcut) {
        onShortcut(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpVisible, onShortcut, onToggle]);

  if (!isHelpVisible) return null;

  const shortcuts = [
    { key: '?', description: 'Show/hide keyboard shortcuts' },
    { key: 'Esc', description: 'Close dialogs and help' },
    { key: '0', description: 'Switch to Grocery List tab' },
    { key: '1', description: 'Switch to Current Prices tab' },
    { key: '2', description: 'Switch to Overview tab' },
    { key: '3', description: 'Switch to Price Trends tab' },
    { key: '4', description: 'Switch to Top Performers tab' },
    { key: '5', description: 'Switch to Compare Products tab' },
    { key: '6', description: 'Switch to Seasonal Analysis tab' },
    { key: '7', description: 'Switch to Price Distribution tab' },
  ];

  return (
    <div className="keyboard-shortcuts-overlay" onClick={() => setHelpVisible(false)}>
      <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2 className="shortcuts-title">
            <FaKeyboard aria-hidden />
            Keyboard Shortcuts
          </h2>
          <button type="button" className="close-button" onClick={() => setHelpVisible(false)} aria-label="Close">
            <FaTimes aria-hidden />
          </button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <kbd className="shortcut-key">{shortcut.key}</kbd>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          <p>Press <kbd>Esc</kbd> or click outside to close</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

