import React, { useState } from 'react';

export interface CardbackLogoProps {
  variant?: 'full' | 'mark';
  className?: string;
  theme?: 'auto' | 'pos_blue' | 'neg_blue' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Official Cardback brand logos
 * Supports:
 * 1. Direct native PNG loading if the user has uploaded Logo_v1_var6_POS_blue.png / Logo_v1_var6_NEG_blue.png into /public
 * 2. High-fidelity vector / typographic rendering using Poppins 900 and exact Euro-slot blister card proportions
 */
export const CardbackLogo: React.FC<CardbackLogoProps> = ({
  variant = 'full',
  className = '',
  theme = 'auto',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  // Height mappings
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8.5',
    lg: 'h-11',
    xl: 'h-14',
    '2xl': 'h-[88px]',
  }[size];

  // Font sizes for the fallback typographic rendering
  const fontSizes = {
    sm: 'text-[20px] leading-none',
    md: 'text-[28px] leading-none',
    lg: 'text-[36px] leading-none',
    xl: 'text-[46px] leading-none',
    '2xl': 'text-[72px] leading-none',
  }[size];

  // Card proportions matching the original blister packaging
  const cardPadding = {
    sm: 'px-1 pt-1.5 pb-0.5 rounded-[5px]',
    md: 'px-1.5 pt-2 pb-0.5 rounded-[7px]',
    lg: 'px-2 pt-2.5 pb-1 rounded-[9px]',
    xl: 'px-2.5 pt-3 pb-1 rounded-[11px]',
    '2xl': 'px-4 pt-5 pb-2 rounded-[18px]',
  }[size];

  const slotDimensions = {
    sm: 'w-4 h-1.5 mb-0.5',
    md: 'w-5.5 h-2 mb-0.5',
    lg: 'w-7 h-2.5 mb-1',
    xl: 'w-9 h-3 mb-1',
    '2xl': 'w-14 h-5 mb-2',
  }[size];

  // Mark variant: Logo_v1_var6_NEG_blue (The floating punch hole + 'db')
  if (variant === 'mark') {
    const markColor =
      theme === 'white'
        ? 'text-white'
        : theme === 'pos_blue'
        ? 'text-[#000B76]'
        : 'text-[#4739F5] dark:text-blue-400';

    return (
      <div className={`inline-flex flex-col items-center justify-center shrink-0 ${heightClasses} ${className}`}>
        {!imgError ? (
          <img
            src="/Logo_v1_var6_NEG_blue.png"
            alt="Cardback"
            className={`${heightClasses} w-auto object-contain dark:brightness-125`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`flex flex-col items-center justify-center ${markColor} select-none`}>
            {/* Floating Euro-slot Peg Hole */}
            <svg
              viewBox="0 0 38 12"
              fill="currentColor"
              className={slotDimensions}
              aria-hidden="true"
            >
              <path d="M 5 11 C 2.5 11 0.5 9 0.5 6.5 C 0.5 4 2.5 2 5 2 L 12.5 2 C 13 2 13.5 1.5 13.5 1 C 13.5 0.5 14 0 14.5 0 L 23.5 0 C 24 0 24.5 0.5 24.5 1 C 24.5 1.5 25 2 25.5 2 L 33 2 C 35.5 2 37.5 4 37.5 6.5 C 37.5 9 35.5 11 33 11 Z" />
            </svg>
            <span
              className={`font-black font-['Poppins',sans-serif] tracking-tight ${fontSizes}`}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900 }}
            >
              db
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full Wordmark: Logo_v1_var6_POS_blue ("car" + [Cardback with punch hole & "db"] + "ack")
  return (
    <div className={`inline-flex items-center shrink-0 select-none ${heightClasses} ${className}`}>
      {!imgError ? (
        <img
          src="/Logo_v1_var6_POS_blue.png"
          alt="Cardback"
          className={`${heightClasses} w-auto object-contain dark:brightness-110`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="flex items-end font-black tracking-[-0.04em]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900 }}
        >
          {/* 'car' letters */}
          <span
            className={`${fontSizes} text-[#000B76] dark:text-white transition-colors`}
            style={{ fontWeight: 900 }}
          >
            car
          </span>

          {/* Central Blister Cardback containing punch hole & 'db' */}
          <div
            className={`mx-[1.5px] bg-[#000B76] flex flex-col items-center justify-between shadow-xs ${cardPadding}`}
            style={{
              boxShadow: '0 1px 3px rgba(0,11,118,0.25)',
            }}
          >
            {/* Euro-slot Hanger Punch Hole in White */}
            <svg
              viewBox="0 0 38 12"
              fill="#FFFFFF"
              className={slotDimensions}
              aria-hidden="true"
            >
              <path d="M 5 11 C 2.5 11 0.5 9 0.5 6.5 C 0.5 4 2.5 2 5 2 L 12.5 2 C 13 2 13.5 1.5 13.5 1 C 13.5 0.5 14 0 14.5 0 L 23.5 0 C 24 0 24.5 0.5 24.5 1 C 24.5 1.5 25 2 25.5 2 L 33 2 C 35.5 2 37.5 4 37.5 6.5 C 37.5 9 35.5 11 33 11 Z" />
            </svg>

            {/* 'db' letters inside card - pure white */}
            <span
              className={`${fontSizes} text-white leading-none block`}
              style={{ fontWeight: 900 }}
            >
              db
            </span>
          </div>

          {/* 'ack' letters */}
          <span
            className={`${fontSizes} text-[#000B76] dark:text-white transition-colors`}
            style={{ fontWeight: 900 }}
          >
            ack
          </span>
        </div>
      )}
    </div>
  );
};
