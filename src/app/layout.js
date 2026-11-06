import Providers from '@/components/Providers';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';
import WHITELABEL from '@/config/whitelabel';

export const metadata = {
  title: WHITELABEL.productName,
  description: WHITELABEL.description,
  icons: {
    icon: WHITELABEL.favicon,
    apple: WHITELABEL.favicon,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}