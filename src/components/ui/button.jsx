import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-terracotta text-white rounded-full hover:bg-gold hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]',
        outline:
          'border-2 border-terracotta text-terracotta bg-transparent rounded-full hover:bg-terracotta hover:text-white',
        ghost:
          'bg-transparent text-deep-blue hover:bg-gray-100 rounded-lg',
        dark:
          'bg-deep-blue text-white rounded-full hover:bg-terracotta hover:-translate-y-0.5',
      },
      size: {
        sm: 'px-5 py-2 text-sm',
        default: 'px-8 py-3.5 text-base',
        lg: 'px-10 py-4 text-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
