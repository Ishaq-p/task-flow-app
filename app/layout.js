// app/layout.js
import { Fraunces, DM_Mono } from "next/font/google";
import { ThemeProvider } from "../lib/hooks/useTheme";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["300","400","600","700"] });
const dmMono   = DM_Mono({  subsets: ["latin"], variable: "--font-mono",    weight: ["300","400","500"] });

export const metadata = { title: "TaskFlow", description: "Personal project & task tracker" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmMono.variable}`} suppressHydrationWarning>
      {/* Inline script prevents flash-of-wrong-theme on load */}
      <head>
        <script dangerouslySetInnerHTML={{ __html:
          `try{const t=localStorage.getItem('taskflow_theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}`
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}