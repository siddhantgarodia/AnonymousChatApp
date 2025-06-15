#!/bin/bash

# Install dependencies first
npm install

# Run SWC patching explicitly
npx @next/swc-patched-node

# Then build the application
npm run build
