#!/bin/bash
set -e

echo "🚀 Starting Open Treasury development environment..."

echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Start services
if [ "$1" == "--db-only" ]; then
    echo "🐳 Starting only database services..."
    docker-compose up -d db adminer
else
    echo "🐳 Starting all services with Docker Compose..."
    docker-compose up --build
fi

echo "✅ Development environment is ready!"
echo "🌐 API Server: http://localhost:4000"
echo "💾 Database Admin: http://localhost:8080"
echo "🔌 PostgreSQL: localhost:5432"
