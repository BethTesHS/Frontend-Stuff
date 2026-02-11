
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number
  onChange: (value: number | undefined) => void
  currency?: string
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, currency = "£", className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      value ? value.toFixed(2) : ''
    )

    React.useEffect(() => {
      setDisplayValue(value ? value.toFixed(2) : '')
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/[^\d.]/g, '')
      setDisplayValue(inputValue)
      
      const numericValue = parseFloat(inputValue)
      onChange(isNaN(numericValue) ? undefined : numericValue)
    }

    const handleBlur = () => {
      if (value) {
        setDisplayValue(value.toFixed(2))
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          {currency}
        </span>
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn("pl-8", className)}
          {...props}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
