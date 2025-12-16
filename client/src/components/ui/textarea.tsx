import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Permitir Ctrl+A (ou Cmd+A no Mac) para selecionar tudo
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.stopPropagation();
      // Não chamar preventDefault para permitir o comportamento padrão
    }
    onKeyDown?.(e);
  };

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
