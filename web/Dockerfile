# Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@latest
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Builder

RUN pnpm build

# Runner
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm -f /etc/nginx/conf.d/default.conf \
 && printf '%s\n' \
 'server {' \
 '  listen 80;' \
 '  server_name _;' \
 '  root   /usr/share/nginx/html;' \
 '  index  index.html;' \
 '  location / {' \
 '    try_files $uri $uri/ /index.html;' \
 '  }' \
 '  location /assets/ {' \
 '    access_log off;' \
 '    add_header Cache-Control "public, max-age=31536000, immutable";' \
 '  }' \
 '}' \
 > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Comands
CMD ["nginx", "-g", "daemon off;"]