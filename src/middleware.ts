export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/pdi/dashboard/:path*",
    "/pdi/admin/:path*",
    "/pdi/avaliacao/:path*",
  ],
};
