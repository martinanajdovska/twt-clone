"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ModeToggle({ label, className, sidebar }: { label?: string; className?: string; sidebar?: boolean } = {}) {
    const { setTheme } = useTheme()

    const icon = (
        <>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </>
    )

    const trigger = label ? (
        <button
            type="button"
            className={cn(
                "flex items-center gap-3 py-3 px-3 text-[19px] font-normal rounded-full hover:bg-accent transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground",
                sidebar
                    ? "w-fit xl:w-fit justify-center xl:justify-start min-w-[48px]"
                    : "w-full",
                className
            )}
        >
            <span className="relative flex h-6 w-6 shrink-0 items-center justify-center [&_svg]:size-[26px] [&_svg]:shrink-0">
                {icon}
            </span>
            <span className={sidebar ? "hidden xl:inline" : undefined}>{label}</span>
        </button>
    ) : (
        <Button variant="outline" size="icon">
            {icon}
        </Button>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
