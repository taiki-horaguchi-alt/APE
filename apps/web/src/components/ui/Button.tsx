'use client'

import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700':
              variant === 'primary',
            'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50':
              variant === 'secondary',
            'border border-neutral-300 text-neutral-700 hover:bg-neutral-50':
              variant === 'outline',
            'text-neutral-700 hover:bg-neutral-100': variant === 'ghost',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
