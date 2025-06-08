// src/components/IconButton.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string; // Added to allow custom styling
}

export function IconButton({ children, ariaLabel, className, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      aria-label={ariaLabel}
      className={cn(className)} // Apply className here
      {...props}
    >
      {children}
    </motion.button>
  );
}
