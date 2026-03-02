'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary:
    'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50',
  outline:
    'border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
  ghost: 'text-neutral-700 hover:bg-neutral-100',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant = 'primary', size = 'md', children, href, ...props }, ref) => {
  const buttonClass = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    )
  }

  return (
    <button ref={ref} className={buttonClass} {...props}>
      {children}
    </button>
  )
})
Button.displayName = 'Button'

export { Button }
