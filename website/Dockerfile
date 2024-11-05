# Use the official Node.js image from Docker Hub
FROM node:20.15.1-slim

# Set the working directory inside the container
WORKDIR /app/website

# Copy the package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Use serve to run the built app
RUN npm install -g serve

# Command to serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]

