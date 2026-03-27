FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (cache optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy rest of the source code
COPY . .

# App listens on this port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
