import './globals.css';
import ClientWrapper from '../components/ClientWrapper';

import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'Free Fire Esports - Admin Control Dashboard',
  description: 'Tournament management, lobbies allocator, result auditor, bans dashboard, and analytics metrics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
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
