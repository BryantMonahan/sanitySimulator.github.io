# Use the official Node.js image as the base image
FROM node:22.15.0

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY . /app

# Install the application dependencies
RUN npm install

EXPOSE 10000

# Define the entry point for the container
CMD ["npm", "start"]