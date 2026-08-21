import React from "react"

interface LogoIconProps {
  className?: string
  size?: number
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="navBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="navBridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Background */}
      <rect width="32" height="32" rx="8.5" fill="url(#navBrandGrad)" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.75"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />

      {/* 'A' Structure - Legs & Flow */}
      <path
        d="M16 8.5L8.5 24"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.5L23.5 24"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 17.5H20.5"
        stroke="url(#navBridgeGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Nodes */}
      <circle cx="16" cy="7.5" r="2.2" fill="white" />
      <circle cx="16" cy="7.5" r="1.1" fill="#4F46E5" />

      <circle cx="8.5" cy="24" r="2.2" fill="white" />
      <circle cx="23.5" cy="24" r="2.2" fill="white" />

      <rect x="14.25" y="15.75" width="3.5" height="3.5" rx="1" fill="white" />
      <rect x="15" y="16.5" width="2" height="2" rx="0.5" fill="#2563EB" />
    </svg>
  )
}