import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth: proxy } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*'],
};

