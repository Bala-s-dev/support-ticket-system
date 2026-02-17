FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Vite needs --host to be accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]