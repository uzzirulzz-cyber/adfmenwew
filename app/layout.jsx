import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: 'PlayBeat Digital — Central Admin',
  description: 'Unified administration for the PlayBeat Digital ecosystem.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
