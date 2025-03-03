#!/bin/bash

# Set database URL with SSL parameters
export DATABASE_URL="postgresql://sugria_db_user:EizRH1LIcqjadVv3VcQl79TeQAmZeYQ4@dpg-cv1pfs3tq21c73da47l0-a.oregon-postgres.render.com/sugria_db?sslmode=require"

# Run migrations
echo "Running migrations..."
yarn prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
yarn prisma generate

echo "Migration complete!" 