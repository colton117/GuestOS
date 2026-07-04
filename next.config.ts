import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { dev }) => {
    // The "Edit Site" dev overlay (components/dev/edit-mode-toggle.tsx,
    // the comment-pin UI it mounts, and their fetch calls to
    // /api/dev/site-comments) must never ship to production browsers.
    // Runtime `NODE_ENV` checks alone aren't enough here: app/layout.tsx
    // statically imports EditModeToggle, so its module graph still gets
    // bundled and fetched by the client even when it renders to null.
    // Aliasing the import to a no-op stub in non-dev builds means webpack
    // never resolves the real module (or anything it imports, including
    // CommentOverlay) into the production bundle at all.
    //
    // NOTE: this relies on webpack's `resolve.alias`, keyed by the
    // *resolved absolute path* (not the "@/..." tsconfig alias string —
    // that form is intercepted by Next's tsconfig-paths plugin before
    // resolve.alias is checked, so it silently no-ops). This does NOT
    // work under `next build --turbopack`, which ignores webpack config
    // entirely. This project's build script (package.json) runs plain
    // `next build`, so webpack is what actually compiles production
    // output — if that ever changes to Turbopack, this alias needs a
    // `turbopack.resolveAlias` equivalent in next.config.ts instead.
    if (!dev) {
      config.resolve.alias[
        path.resolve(__dirname, "components/dev/edit-mode-toggle.tsx")
      ] = path.resolve(__dirname, "components/dev/edit-mode-toggle.stub.tsx");
    }
    return config;
  },
};

export default nextConfig;
