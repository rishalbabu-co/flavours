# Use Node.js Alpine-based image for smaller size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better cache utilization
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port for the Vite preview server
EXPOSE 3000

# Start the preview server
CMD ["npm", "run", "preview"]