export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/notifications/:path*",
    "/coordination/:path*",
    "/profile/:path*",
  ],
};
