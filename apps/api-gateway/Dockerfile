# 1. Use the official Node.js lightweight image
FROM node:24

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first (better for caching)
COPY package.json ./

# 4. Install dependencies
# Note: In a real monorepo, we would copy the root package.json too,
# but for this "Walking Skeleton", we keep it simple.
RUN npm install

# 5. Copy the rest of the code
COPY . .

# 6. Build the TypeScript code (if you have a build step)
# RUN npm run build

# 7. Expose the port
EXPOSE 8080

# 8. Start the app
CMD ["npm", "run", "dev"]