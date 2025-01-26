# Étape 1: Build de l'application Angular
FROM node:18 AS build
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./
RUN npm install

# Copier tout le projet dans le conteneur
COPY . .

# Construire l'application Angular (remplace 'production' par ton environnement si nécessaire)
RUN npm run build -- --configuration production

# Étape 2: Servir l'application avec Nginx
FROM nginx:1.23-alpine
COPY --from=build /app/dist/projet-front /usr/share/nginx/html


# Copier le fichier de configuration Nginx personnalisé si nécessaire
COPY nginx.conf /etc/nginx/nginx.conf

RUN chmod -R 755 /usr/share/nginx/html


# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
