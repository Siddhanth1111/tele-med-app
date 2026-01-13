FROM node:24

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Expose the default Vite port
EXPOSE 5173

# Host 0.0.0.0 is required for Docker to expose the port to your machine
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]