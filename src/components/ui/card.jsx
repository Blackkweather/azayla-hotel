import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(27,58,75,0.08)]', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-6 pb-0', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}
