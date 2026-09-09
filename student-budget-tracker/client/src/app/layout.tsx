import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Budget & Expense Tracker',
  description: 'Full-stack student allowance and budget management dashboard for university students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

