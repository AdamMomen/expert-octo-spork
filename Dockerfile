# Simple Dockerfile: Next.js with Playwright
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Set environment
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
