import type { NextConfig } from "next";

/**
 * Every avatar in the app - staff and students alike, see `Avatar` in
 * `components/student-portal/ui.tsx` - is a plain `<img>` pointing straight
 * at Unsplash, not proxied through `next/image`. A browser enforcing a
 * Content-Security-Policy blocks an `<img>` whose origin is not in `img-src`
 * before it ever requests it, which is silent in dev (no CSP is sent unless
 * one is configured, so nothing here stops it locally) and only bites after
 * a deploy that adds one - exactly the gap this header closes now, rather
 * than after someone else's CSP breaks every avatar in one release.
 *
 * ONLY `img-src` IS SET, deliberately. This is not a general security policy
 * for the app - no audit of every script, style and font has been done to
 * write one responsibly - so every other resource type is left unrestricted
 * (omitting a directive, with no `default-src` to fall back to, means the
 * browser does not restrict it at all). Restricting only the one thing this
 * change actually needs restricted keeps that a decision for later, made on
 * purpose, rather than an accidental side effect of this one.
 */
const CSP = "img-src 'self' data: https://images.unsplash.com";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: CSP }],
      },
    ];
  },
};

export default nextConfig;
