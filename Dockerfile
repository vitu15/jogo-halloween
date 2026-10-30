# ---- Build do frontend ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci
COPY shared shared
COPY frontend frontend
RUN npm run build

# ---- Runtime (backend servindo o build) ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false && npm cache clean --force
COPY shared shared
COPY backend/src backend/src
COPY --from=build /app/frontend/dist frontend/dist
USER node
EXPOSE 3000
CMD ["node", "backend/src/server.js"]
