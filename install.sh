#!/bin/bash
echo "Installing Celed..."
git clone https://github.com/yourusername/celed.git ~/.celed
cd ~/.celed
npm install
npm run build
npm link
echo "Celed installed successfully! Try running: celed run script.ce"
