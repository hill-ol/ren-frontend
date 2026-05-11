import './global.css';

export const metadata = {
  title: 'ren',
  description: 'your personal AI system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans text-pk-text antialiased">{children}</body>
    </html>
  );
}