import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opervio Finance Lite',
  description: 'Controle financeiro simples, bonito e vendável para pequenos negócios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
