#!/bin/bash

# Create templates directory if it doesn't exist
mkdir -p dist/email/templates

# Copy templates
cp -r src/email/templates/* dist/email/templates/

echo "Email templates setup complete!" 