# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the HOST POS project.

## Workflows

### 🔄 CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Lint**: Runs Biome linter on all packages
2. **Type Check**: Runs TypeScript type checking
3. **Test**: Runs all unit tests with coverage reporting
4. **Build**: Builds all packages and apps

**Features:**
- Turborepo caching for faster builds
- Parallel job execution
- Coverage reporting to Codecov
- Build artifacts uploaded for debugging

**Required Secrets:**
- `TURBO_TOKEN` (optional): Vercel Remote Cache token
- `TURBO_TEAM` (optional): Vercel team slug
- `CODECOV_TOKEN` (optional): Codecov upload token

---

### 🚀 Deployment Pipeline (`deploy.yml`)

**Triggers:**
- Push to `main` branch → Staging deployment
- Tag push with `v*` pattern → Production deployment
- Manual workflow dispatch

**Environments:**
- **Staging**: `https://staging.host-pos.com`
- **Production**: `https://app.host-pos.com`

**Required Secrets:**
- `STAGING_DATABASE_URL`: Turso staging database URL
- `STAGING_DATABASE_AUTH_TOKEN`: Turso staging auth token
- `PRODUCTION_DATABASE_URL`: Turso production database URL
- `PRODUCTION_DATABASE_AUTH_TOKEN`: Turso production auth token
- `VERCEL_TOKEN`: Vercel deployment token
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions

---

### 🔒 Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Dependency Review**: Checks for security vulnerabilities in dependencies
2. **Security Audit**: Runs npm audit and Snyk security scanning

**Features:**
- Fails on moderate+ severity vulnerabilities
- License compliance checking
- Blocks disallowed licenses (GPL-3.0, AGPL-3.0)

**Required Secrets:**
- `SNYK_TOKEN` (optional): Snyk API token for enhanced security scanning

---

## Setup Instructions

### 1. Enable GitHub Actions

Ensure GitHub Actions is enabled in your repository settings:
- Go to Settings → Actions → General
- Select "Allow all actions and reusable workflows"

### 2. Configure Secrets

Add required secrets in Settings → Secrets and variables → Actions:

```bash
# Turbo (Optional - for remote caching)
TURBO_TOKEN=your-vercel-remote-cache-token
TURBO_TEAM=your-team-slug

# Codecov (Optional - for coverage reporting)
CODECOV_TOKEN=your-codecov-token

# Turso Database
STAGING_DATABASE_URL=libsql://your-staging-db.turso.io
STAGING_DATABASE_AUTH_TOKEN=your-staging-token
PRODUCTION_DATABASE_URL=libsql://your-production-db.turso.io
PRODUCTION_DATABASE_AUTH_TOKEN=your-production-token

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token

# Snyk (Optional - for security scanning)
SNYK_TOKEN=your-snyk-token
```

### 3. Configure Environments

Create protected environments in Settings → Environments:

**Staging:**
- No required reviewers
- Deployment branch: `main`

**Production:**
- Required reviewers: 1+ team members
- Deployment branch: `main` and tags matching `v*`

### 4. Enable Turbo Remote Caching (Optional)

For faster CI builds, enable Vercel Remote Caching:

```bash
# Login to Vercel
npx turbo login

# Link your repository
npx turbo link
```

Then add `TURBO_TOKEN` and `TURBO_TEAM` secrets from `~/.turbo/config.json`.

---

## Testing Workflows Locally

### Using `act`

Install [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
choco install act-cli  # Windows

# Test CI workflow
act pull_request

# Test specific job
act pull_request -j test

# Test with secrets
act pull_request --secret-file .env.secrets
```

### Manual Workflow Validation

Validate workflow syntax:

```bash
# Install GitHub CLI
gh workflow list

# View workflow runs
gh run list --workflow=ci.yml

# View specific run
gh run view <run-id>
```

---

## Troubleshooting

### Build Failures

1. **TypeScript errors**: Run `npm run typecheck` locally
2. **Lint errors**: Run `npm run lint:fix` locally
3. **Test failures**: Run `npm test` locally
4. **Coverage below threshold**: Run `npm run test:coverage` locally

### Deployment Failures

1. **Database connection**: Verify `DATABASE_URL` and `DATABASE_AUTH_TOKEN` secrets
2. **Vercel deployment**: Check `VERCEL_TOKEN` is valid
3. **Environment variables**: Ensure all required env vars are set in deployment environment

### Dependency Review Failures

1. **Moderate+ vulnerabilities**: Run `npm audit` and update vulnerable packages
2. **License issues**: Check package licenses with `npx license-checker`
3. **Snyk failures**: Review Snyk dashboard for detailed vulnerability information

---

## Best Practices

### Branch Protection Rules

Configure branch protection for `main`:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  - lint
  - typecheck
  - test
  - build
☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings
```

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
chore: Update tooling
refactor: Refactor code
perf: Performance improvement
```

### PR Size Recommendations

- **Small**: < 200 lines changed (✅ Ideal)
- **Medium**: 200-500 lines changed (⚠️ Acceptable)
- **Large**: 500-1000 lines changed (❌ Consider splitting)
- **Huge**: > 1000 lines changed (🚫 Must split)

---

## Monitoring

### GitHub Actions Dashboard

View workflow runs: `https://github.com/YOUR_ORG/host/actions`

### Coverage Reports

View coverage: `https://codecov.io/gh/YOUR_ORG/host`

### Performance Metrics

Track CI performance:
- Average build time: Target < 5 minutes
- Cache hit rate: Target > 80%
- Test execution time: Target < 2 minutes

---

*Last Updated: 2025-10-02*
*Maintained by: HOST Development Team*
