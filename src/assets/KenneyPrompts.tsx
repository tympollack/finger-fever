import React from 'react';
import { GesturePromptType } from '../types';

export interface PromptIconProps {
  type: GesturePromptType;
  size?: number;
  className?: string;
  color?: string;
}

export const KenneyPromptIcon: React.FC<PromptIconProps> = ({
  type,
  size = 36,
  className = '',
  color = '#ffffff',
}) => {
  switch (type) {
    case 'tap':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-tap"
        >
          {/* Kenney Input Prompt - Touch Tap */}
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <circle cx="24" cy="24" r="14" fill="#334155" />
          <circle cx="24" cy="24" r="7" fill={color} />
          {/* Pulse ripples */}
          <circle
            cx="24"
            cy="24"
            r="11"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.8"
          />
        </svg>
      );

    case 'double_tap':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-double-tap"
        >
          {/* Kenney Input Prompt - Double Tap */}
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <circle cx="20" cy="22" r="10" fill="#334155" stroke={color} strokeWidth="1.5" />
          <circle cx="28" cy="26" r="10" fill="#475569" stroke={color} strokeWidth="1.5" />
          <text
            x="24"
            y="26"
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize="12"
            fontWeight="900"
            fontFamily="monospace"
          >
            2X
          </text>
        </svg>
      );

    case 'swipe_left':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-swipe-left"
        >
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <path
            d="M28 14 L16 24 L28 34"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 18 L26 24 L34 30"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );

    case 'swipe_right':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-swipe-right"
        >
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <path
            d="M20 14 L32 24 L20 34"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 18 L22 24 L14 30"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );

    case 'swipe_up':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-swipe-up"
        >
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <path
            d="M14 28 L24 16 L34 28"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 34 L24 26 L30 34"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );

    case 'swipe_down':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          data-testid="kenney-prompt-swipe-down"
        >
          <circle cx="24" cy="24" r="20" fill="#1e293b" stroke={color} strokeWidth="3" />
          <path
            d="M14 20 L24 32 L34 20"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 14 L24 22 L30 14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );
  }
};
