import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: ReactNode
}

export function Button({ children, to, variant = 'primary', icon, className = '', ...buttonProps }: ButtonProps) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  )
  const classes = `btn btn-${variant} ${className}`.trim()

  if (to) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  )
}
