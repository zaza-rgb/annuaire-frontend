# Étape 1 : Build de l'application React Vite
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variable d'URL d'API (pointant par défaut sur l'API Wasmer en ligne)
ARG VITE_API_URL=https://annuaire-backend.wasmer.app/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Étape 2 : Serveur de fichiers statiques léger Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
