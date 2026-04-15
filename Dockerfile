# Stage 1: build
FROM node:24-slim AS builder

# Install esbuild globally (no package.json scripts needed)
RUN npm install -g esbuild

# Create and change to the app directory
WORKDIR /app

# Copy package.json and install esbuild globally
COPY package.json .

# Install dependencies (if you have any, otherwise this can be skipped)
RUN npm install

# Copy source code
COPY . .

# Bundle app directly with esbuild
RUN esbuild src/index.js \
    --bundle \
    --platform=node \
    --target=node24 \
    --outfile=dist/index.js \
    --minify \
    --external:sharp \
    --external:bcrypt \
    --external:sqlite3

# Stage 2: runtime
FROM node:24-slim

# Create and change to the app directory
WORKDIR /app

# Copy bundled app
COPY --from=builder /app/dist/index.js .

# Touch .env if not exists to avoid runtime errors
RUN touch .env

# Security
RUN useradd -m appuser
USER appuser

# Expose the port your app listens on
EXPOSE 3000

CMD ["node", "--env-file=.env", "index.js"]