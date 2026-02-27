#!/bin/bash
set -e

echo "🚀 Deploying Open Treasury to production..."

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found. Please create one from .env.example"
    exit 1
fi

# Build and start services
echo "🐳 Building and starting production services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "✅ Production deployment complete!"
echo "🌐 API Server: http://${HOST:-localhost}:${PORT:-4000}"
