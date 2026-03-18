import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenView | Opervio Finance Lite',
  description:
    'Dashboard financeiro com visual premium para controle, análise e apresentação comercial.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}