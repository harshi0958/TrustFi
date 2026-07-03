import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2",
        "text-white placeholder:text-zinc-500",
        "outline-none transition-all",
        "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "autofill:bg-zinc-900 autofill:text-white",
        className
      )}
      {...props}
    />
  );
}

export { Input };