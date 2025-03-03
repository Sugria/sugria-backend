#!/bin/bash

# Set database URL with SSL parameters
export DATABASE_URL="postgresql://sugria_db_user:EizRH1LIcqjadVv3VcQl79TeQAmZeYQ4@dpg-cv1pfs3tq21c73da47l0-a.oregon-postgres.render.com/sugria_db?sslmode=require"

# Apply the fix for Member table
psql "$DATABASE_URL" -f prisma/migrations/fix_member_email.sql

# Run migrations
yarn prisma migrate reset --force

# Generate Prisma client
yarn prisma generate 