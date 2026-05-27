import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-bold uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-terracotta text-white px-3 py-1',
        secondary: 'bg-white/95 text-deep-blue px-3 py-1',
        outline: 'border-2 border-terracotta text-terracotta bg-transparent px-3 py-1',
        gold: 'bg-gold text-white px-3 py-1',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
