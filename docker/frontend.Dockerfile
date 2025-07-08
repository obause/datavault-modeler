FROM node:20-alpine

# Set work directory
WORKDIR /app

# Install dependencies
COPY frontend/dvw-frontend/package*.json /app/
RUN npm ci --only=production

# Copy source code
COPY frontend/dvw-frontend /app/

# Build the application
RUN npm run build

# Expose port
EXPOSE 5173

# Run the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"] 