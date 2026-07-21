import './globals.css';
import ClientWrapper from '../components/ClientWrapper';

import { GoogleOAuthProvider } from '@react-oauth/google';
import Script from 'next/script';

export const metadata = {
  title: 'Free Fire Arena - Esports Tournament Platform',
  description: 'Join competitive Free Fire rooms, showcase your gaming skills, and earn real wallet awards.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '136435528898-l8e1usq6lhk73akq72emj7pr85huidhj.apps.googleusercontent.com'}>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
