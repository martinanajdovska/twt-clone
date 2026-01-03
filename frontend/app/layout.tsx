import type {Metadata} from 'next'
import QueryProvider from "@/providers/QueryProvider";
import {ThemeProvider} from "@/providers/ThemeProvider";
import "../styles/globals.css"

export const metadata: Metadata = {
    title: 'Twitter Clone',
    description: 'Twitter clone with Spring Boot and NextJS',
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className="bg-background text-foreground min-h-screen antialiased">
        <QueryProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </QueryProvider>
        </body>
        </html>
    )
}