# syntax=docker/dockerfile:1.7

###
# Stage 1: dependencies (cached)
###
FROM node:22-alpine AS deps
WORKDIR /app

# native modules compatibility (e.g. optional bcrypt fallbacks)
RUN apk add --no-cache libc6-compat

# copy only manifests first for max layer cache reuse
COPY package.json package-lock.json ./

# install production dependencies only
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && \
    npm cache clean --force

###
# Stage 2: runtime
###
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100

# security hardening: least privilege runtime user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# copy only what runtime needs
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations

# ensure app files owned by non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 4100

# container-level healthcheck (uses existing /health endpoint)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const http=require('http');const port=process.env.PORT||4100;const req=http.get({host:'127.0.0.1',port,path:'/health',timeout:3000},res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.on('timeout',()=>{req.destroy();process.exit(1);});"

# graceful signal handling is already implemented in bootstrap.js
CMD ["node", "src/main/bootstrap.js"]
