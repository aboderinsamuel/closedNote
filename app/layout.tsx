import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PromptsProvider } from "@/lib/PromptsContext";
import { SearchPalette } from "@/components/SearchPalette";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "closedNote",
  description: "",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})()` }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PromptsProvider>
              {children}
              {/* Global search palette overlay */}
              <SearchPalette />
            </PromptsProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
