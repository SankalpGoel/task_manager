#!/bin/bash
set -e

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying to backend static directory..."
rm -rf backend/static
cp -r frontend/dist backend/static

echo "Build complete."
