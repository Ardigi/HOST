# HOST POS Development Environment Setup Script
# PowerShell script for Windows developers

<#
.SYNOPSIS
    Automated setup script for HOST POS development environment.

.DESCRIPTION
    This script automates the setup of the development environment:
    - Checks prerequisites
    - Installs dependencies
    - Configures environment files
    - Sets up database
    - Seeds test data
    - Starts development server

.EXAMPLE
    .\scripts\dev-setup.ps1

.NOTES
    Requires PowerShell 5.1 or higher
#>

param(
    [switch]$SkipPrereqs,
    [switch]$SkipDatabase,
    [switch]$SkipSeed,
    [switch]$StartServer
)

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  HOST POS Development Setup         " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Colors for output
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Blue }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }

# Step 1: Check Prerequisites
if (-not $SkipPrereqs) {
    Write-Info "Step 1: Checking prerequisites..."
    Write-Host ""

    # Check Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion -match "v(\d+)\.") {
            $majorVersion = [int]$Matches[1]
            if ($majorVersion -ge 24) {
                Write-Success "Node.js $nodeVersion (✓ >= v24.0.0)"
            } else {
                Write-Error "Node.js $nodeVersion is too old. Required: >= v24.0.0"
                Write-Warning "Please install Node.js 24 LTS from https://nodejs.org/"
                exit 1
            }
        }
    } catch {
        Write-Error "Node.js not found"
        Write-Warning "Please install Node.js 24 LTS from https://nodejs.org/"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm v$npmVersion"
    } catch {
        Write-Error "npm not found"
        exit 1
    }

    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "$gitVersion"
    } catch {
        Write-Error "Git not found"
        Write-Warning "Please install Git from https://git-scm.com/"
        exit 1
    }

    # Check Docker (optional)
    try {
        $dockerVersion = docker --version
        Write-Success "$dockerVersion"
    } catch {
        Write-Warning "Docker not found (optional for local services)"
    }

    Write-Host ""
}

# Step 2: Install Dependencies
Write-Info "Step 2: Installing dependencies..."
Write-Host ""

try {
    Write-Info "Running npm install..."
    npm install
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies"
    Write-Warning "Try running: npm install --legacy-peer-deps"
    exit 1
}

Write-Host ""

# Step 3: Environment Configuration
Write-Info "Step 3: Configuring environment files..."
Write-Host ""

$envFiles = @(
    @{ Source = ".env.example"; Dest = ".env.local" },
    @{ Source = "apps/pos/.env.example"; Dest = "apps/pos/.env.local" },
    @{ Source = "packages/database/.env.example"; Dest = "packages/database/.env.local" }
)

foreach ($env in $envFiles) {
    if (Test-Path $env.Source) {
        if (-not (Test-Path $env.Dest)) {
            Copy-Item $env.Source $env.Dest
            Write-Success "Created $($env.Dest)"
        } else {
            Write-Warning "Skipped $($env.Dest) (already exists)"
        }
    } else {
        Write-Warning "Source file $($env.Source) not found"
    }
}

Write-Host ""
Write-Info "Please edit the .env.local files with your configuration:"
Write-Host "  - .env.local"
Write-Host "  - apps/pos/.env.local"
Write-Host "  - packages/database/.env.local"
Write-Host ""

$continue = Read-Host "Have you configured the environment files? (y/n)"
if ($continue -ne "y") {
    Write-Warning "Setup paused. Please configure environment files and run this script again."
    exit 0
}

# Step 4: Database Setup
if (-not $SkipDatabase) {
    Write-Info "Step 4: Setting up database..."
    Write-Host ""

    try {
        Write-Info "Running database migrations..."
        npm run db:migrate
        Write-Success "Database migrations applied"
    } catch {
        Write-Error "Database migration failed"
        Write-Warning "Ensure your DATABASE_URL is correctly configured"
        exit 1
    }

    Write-Host ""
}

# Step 5: Seed Test Data
if (-not $SkipSeed) {
    Write-Info "Step 5: Seeding test data..."
    Write-Host ""

    try {
        npm run db:seed
        Write-Success "Test data seeded successfully"
    } catch {
        Write-Warning "Failed to seed test data (non-critical)"
    }

    Write-Host ""
}

# Step 6: Verify Installation
Write-Info "Step 6: Verifying installation..."
Write-Host ""

try {
    Write-Info "Running type check..."
    npm run typecheck
    Write-Success "TypeScript compilation successful"
} catch {
    Write-Error "Type check failed"
}

try {
    Write-Info "Running linter..."
    npm run lint
    Write-Success "Linting passed"
} catch {
    Write-Warning "Linting issues found (non-critical)"
}

Write-Host ""

# Step 7: Build Shared Packages
Write-Info "Step 7: Building shared packages..."
Write-Host ""

try {
    npm run build --filter=@host/shared
    Write-Success "Shared packages built successfully"
} catch {
    Write-Warning "Failed to build shared packages"
}

Write-Host ""

# Setup Complete
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Setup Complete! 🎉                 " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Write-Info "Next steps:"
Write-Host ""
Write-Host "  Start POS application:"
Write-Host "    npm run dev:pos" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Start all applications:"
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Run tests:"
Write-Host "    npm test" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View documentation:"
Write-Host "    Open docs/README.md" -ForegroundColor Cyan
Write-Host ""

# Optionally start server
if ($StartServer) {
    Write-Info "Starting development server..."
    Write-Host ""
    npm run dev:pos
} else {
    $startNow = Read-Host "Start development server now? (y/n)"
    if ($startNow -eq "y") {
        npm run dev:pos
    } else {
        Write-Info "Run 'npm run dev:pos' when ready to start development"
    }
}

Write-Host ""
Write-Success "Happy coding! 🚀"
Write-Host ""