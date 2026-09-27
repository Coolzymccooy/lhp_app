# Dockerfile — The Lighthouse Church RCCG
# Single Node service: Express serves the built React client + /api + SQLite + uploaded images.
# Used by Coolify (build_pack = dockerfile). Render uses render.yaml (Nixpacks) instead.
#
# Why node:22-bookworm (not slim, not Nixpacks default):
#   - Vite 8 (rolldown) requires Node >= 22.12; the Nixpacks base pinned 22.11 and failed.
#     The :22 tag tracks the latest 22.x (>= 22.12), satisfying Vite + rolldown.
#   - The full bookworm image ships python3/make/g++, so better-sqlite3 compiles if a
#     prebuilt binary is unavailable for this ABI.
FROM node:22-bookworm

WORKDIR /app

# Copy the repo (node_modules / dist / secrets excluded via .dockerignore).
COPY . .

# Strip any committed package-lock.json before installing. The client lockfile is
# generated on Windows and pins win32-only rolldown bindings; honoring it on linux
# skips @rolldown/binding-linux-x64-gnu (npm optional-deps bug npm/cli#4828) and the
# build crashes with "Cannot find native binding". A fresh install resolves the
# correct linux-x64 native deps (rolldown, better-sqlite3) for this platform.
# --include=dev keeps tsc/vite available for the build.
#
# Installed with `cd` rather than `npm install --prefix`, and on a pinned npm.
# The npm bundled with node:22-bookworm (10.9.9) crashes partway through the
# server install with "Cannot read properties of null (reading 'edgesOut')" —
# an arborist bug reached via the --prefix path. Because the lockfiles are
# deleted above, each build re-resolves every range fresh, so a build that
# worked last month can fail today with no change to this repo. Pinning npm
# keeps the resolver itself fixed even though the dependency ranges float.
RUN npm install -g npm@11 \
 && rm -f package-lock.json client/package-lock.json server/package-lock.json \
 && npm install --include=dev \
 && (cd client && npm install --include=dev) \
 && (cd server && npm install --include=dev) \
 && npm run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Express reads PORT and serves the SPA + API. DATA_DIR (set in Coolify) points the
# SQLite DB + uploads at the persistent volume mounted at /app/data.
CMD ["npm", "start"]
