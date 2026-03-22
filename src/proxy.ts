import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});

export default auth;

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/items/:path*'],
};
