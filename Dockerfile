# Dependency instalation
FROM node:12.1.0-alpine AS builder
WORKDIR /www
COPY package*json ./
RUN npm ci

# Build project
COPY src ./src
COPY tsconfig*json ./
RUN npm run build

# Install production dependencies and copy build
FROM node:12.1.0-alpine
WORKDIR /www
COPY package*json ./
RUN npm install --production
COPY --from=builder /www/dist ./dist

CMD ["node", "dist/main"]
