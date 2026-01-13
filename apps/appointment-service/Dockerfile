# apps/appointment-service/Dockerfile
FROM node:24
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate  
EXPOSE 3002
CMD ["npm", "run", "dev"]