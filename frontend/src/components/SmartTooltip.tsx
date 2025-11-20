import { useState, useRef, useEffect } from 'react';
import './SmartTooltip.css';

interface SmartTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

const SmartTooltip = ({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  disabled = false 
}: SmartTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - tooltipRect.height - 8;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + 8;
          break;
      }

      // Adjust if tooltip goes off screen
      if (left < 8) {
        left = 8;
        setTooltipPosition('right');
      } else if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
        setTooltipPosition('left');
      }

      if (top < 8) {
        top = 8;
        setTooltipPosition('bottom');
      } else if (top + tooltipRect.height > window.innerHeight - 8) {
        top = window.innerHeight - tooltipRect.height - 8;
        setTooltipPosition('top');
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className="smart-tooltip-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`smart-tooltip smart-tooltip-${tooltipPosition}`}
          role="tooltip"
        >
          {content}
          <div className={`smart-tooltip-arrow smart-tooltip-arrow-${tooltipPosition}`}></div>
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;



