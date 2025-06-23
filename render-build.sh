#!/usr/bin/env bash
# filepath: render-build.sh

# Install ALL dependencies (including devDependencies)
npm install --include=dev

# Build the project
npm run build