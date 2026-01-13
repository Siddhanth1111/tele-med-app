FROM node:24
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# No Prisma here, so no 'prisma generate' needed
EXPOSE 3003
CMD ["npm", "run", "dev"]