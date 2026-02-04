import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number // Make it optional in the interface
  // Backward-compat for accidental camelCase usage
  typeOf?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, typeOf, typeof: typeofProp, maxLength = 255, ...props }, ref) => {
    const resolvedType = type ?? typeOf ?? typeofProp
    return (
      <input
        type={resolvedType}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        maxLength={maxLength}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
