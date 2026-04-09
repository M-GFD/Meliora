import { withAuth } from "next-auth/middleware";

/** Solo el canal de coordinación exige sesión; el resto de la plataforma es navegable sin cuenta. */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: ["/coordination/:path*"],
};
