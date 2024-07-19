# Use the official Node.js image from the Docker Hub
FROM node:22

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm audit fix --force

# Copy the rest of the application files
COPY . .

# Start the application
EXPOSE 4000
CMD ["node", "server"]
