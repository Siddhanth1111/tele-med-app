FROM node:18

WORKDIR /app

COPY package.json ./

# 1. Install dependencies
RUN npm install

# 2. Copy the rest of the code (including prisma/schema.prisma)
COPY . .

# 3. GENERATE THE PRISMA CLIENT (This is the missing magic line)
# This creates the typescript definitions inside the container
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]