#!/bin/bash
set -e

# This script runs inside the PostgreSQL container on first start
# It ensures the database is properly initialized

echo "Initializing database..."

# Create the database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- You can add other database initialization commands here
    -- For example, create additional roles or schemas
EOSQL

echo "Database initialization complete!"
