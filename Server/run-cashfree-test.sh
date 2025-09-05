#!/bin/bash

# Script to run the Cashfree test server with the correct environment

# Change directory to the server folder
cd "$(dirname "$0")"

# Check if .env.cashfree-test exists
if [ ! -f ".env.cashfree-test" ]; then
  echo "Error: .env.cashfree-test file not found!"
  echo "Please create this file with your Cashfree credentials first."
  exit 1
fi

# Check if public directory exists, create if not
if [ ! -d "public" ]; then
  echo "Creating public directory..."
  mkdir -p public
fi

# Check if the HTML file exists in the public directory
if [ ! -f "public/cashfree-test.html" ]; then
  echo "Error: public/cashfree-test.html not found!"
  echo "Please ensure the test HTML file is in place."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed!"
  exit 1
fi

# Install required dependencies if not already installed
echo "Checking dependencies..."
if ! npm list uuid | grep -q uuid; then
  echo "Installing uuid package..."
  npm install --no-save uuid
fi

# Run the server with the test environment file
echo "Starting Cashfree test server..."
NODE_ENV=test env $(cat .env.cashfree-test | xargs) node standalone-cashfree-server.js
