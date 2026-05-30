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
# install:all passes --include=dev so tsc/vite are available for the build.
RUN rm -f package-lock.json client/package-lock.json server/package-lock.json \
 && npm run install:all \
 && npm run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Express reads PORT and serves the SPA + API. DATA_DIR (set in Coolify) points the
# SQLite DB + uploads at the persistent volume mounted at /app/data.
CMD ["npm", "start"]
