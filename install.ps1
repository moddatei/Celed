Write-Host "Installing Celed..."
git clone https://github.com/yourusername/celed.git $env:USERPROFILE\.celed
Set-Location $env:USERPROFILE\.celed
npm install
npm run build
npm link
Write-Host "Celed installed successfully! Try running: celed run script.ce"
