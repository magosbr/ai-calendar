# Use the official Node.js image.
FROM node:22

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install app dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of the application code.
COPY . .

# Install TypeScript globally.
RUN npm install -g typescript

# Expose the port the app runs on.
EXPOSE 3000

# Run the application using ts-node-dev for live reload.
CMD ["npx", "ts-node-dev", "--respawn", "src/web/server.ts"]
