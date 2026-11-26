import './globals.css';

export const metadata = {
  metadataBase: new URL('https://lucamaiolo.github.io'),
  title: 'Luca Maiolo | LM/OS',
  description: 'Portfolio of Luca Maiolo, a Computer Science student at John Abbott College in Montreal who builds web apps and studies how they get broken into.',
  openGraph: {
    title: 'Luca Maiolo | LM/OS',
    description: 'Projects on USB sticks, loaded into a DJ deck. The portfolio of Luca Maiolo.',
    url: '/',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230a0a0c'/%3E%3Ctext x='16' y='22' font-family='monospace' font-size='15' font-weight='700' text-anchor='middle' fill='%23ff6a55'%3ELM%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060606',
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Doto:ROND,wght@0..100,100..900&family=Archivo:wdth,wght@62..125,100..900&family=Permanent+Marker&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
