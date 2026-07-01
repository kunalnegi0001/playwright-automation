FROM mcr.microsoft.com/playwright:v1.42.0-focal

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.1

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs test-results screenshots videos .auth allure-results

# Set environment variables
ENV NODE_ENV=production
ENV CI=true

# Run tests
CMD ["pnpm", "test"]
