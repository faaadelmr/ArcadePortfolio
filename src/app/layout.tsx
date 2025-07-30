import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LocalizationProvider } from '@/hooks/useLocalization';
import { VisualSettingsProvider } from '@/hooks/useVisualSettings';

export const metadata: Metadata = {
  title: 'Portofolio ARCADE by Fadel Muhamad Rifai',
  description: 'Dengan tema arcade, disini kalian bisa #CobaAjaDulu untuk melihat proyek apa saja yang telah saya kerjakan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <LocalizationProvider>
          <VisualSettingsProvider>
            {children}
          </VisualSettingsProvider>
        </LocalizationProvider>
        <Toaster />
      </body>
    </html>
  );
}
