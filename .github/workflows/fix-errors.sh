#!/bin/bash

# This script runs the necessary commands for fixing and building the project.

# Step 1: Install Prettier and ESLint as dev dependencies
npm install --save-dev prettier eslint

# Step 2: Fix ESLint issues
npx eslint --fix .

# Step 3: Format files with Prettier
npx prettier --write .

# Step 4: Run the build command
npm run build
