# build stage
FROM node:20-alpine AS build
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# copy source
COPY . .

# allow overriding API base at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# build
RUN npm run build

# serve with nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# remove default nginx static assets
RUN rm -rf ./*
COPY --from=build /app/dist .

# minimal nginx config (optional to tweak later)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
