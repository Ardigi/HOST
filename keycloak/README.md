# Keycloak Authentication Setup

## Overview

HOST POS uses Keycloak 26.3.2 for OpenID Connect (OIDC) authentication with PostgreSQL as the backend database.

## Quick Start

### Start Keycloak and PostgreSQL

```bash
docker-compose up -d postgres keycloak
```

### Access Admin Console

- **URL**: http://localhost:8080
- **Username**: admin
- **Password**: admin

## Realm Configuration

### Realm: `host-pos`

- **Display Name**: HOST POS System
- **SSL Required**: None (development)
- **Login with Email**: Enabled
- **Remember Me**: Enabled
- **Brute Force Protection**: Enabled (30 failures, 15min lockout)

### OIDC Client: `host-pos-web`

- **Client ID**: `host-pos-web`
- **Client Type**: Public (browser-based SPA)
- **Root URL**: http://localhost:5173
- **Valid Redirect URIs**:
  - http://localhost:5173/*
  - http://localhost:3000/*
  - http://localhost:4173/*
- **Web Origins**: Same as redirect URIs
- **PKCE**: Enabled (S256 code challenge method)
- **Standard Flow**: Enabled (Authorization Code flow)
- **Direct Access Grants**: Enabled (for testing)

### Realm Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access - manage all resources |
| `manager` | Orders, inventory, reports, staff management |
| `server` | Create/update orders, process payments |
| `bartender` | View/update bar orders, view bar inventory |
| `kitchen` | View/update food orders |

### Token Configuration

- **Access Token Lifespan**: 5 minutes
- **SSO Session Idle Timeout**: 30 minutes
- **SSO Session Max Lifespan**: 10 hours
- **Offline Session Idle**: 30 days

## Protocol Mappers

The client includes the following custom claims in tokens:

- `realm_access.roles` - Array of user roles
- `email` - User email address
- `given_name` - First name
- `family_name` - Last name
- `venue_id` - Custom attribute for venue association

## Integration with SvelteKit

### Environment Variables

```bash
# .env.local
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=host-pos
KEYCLOAK_CLIENT_ID=host-pos-web
```

### Installation

```bash
npm install @auth/sveltekit jose
```

### Usage Example

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { handleAuth } from '$lib/server/auth';

export const handle = sequence(handleAuth);
```

## Creating Test Users

### Via Admin Console

1. Navigate to http://localhost:8080/admin/
2. Select `host-pos` realm
3. Go to Users → Add User
4. Fill in user details
5. Set temporary password in Credentials tab
6. Assign roles in Role Mappings tab

### Via CLI

```bash
# Create a user
docker exec host-keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r host-pos \
  -s username=john.server \
  -s email=john@example.com \
  -s firstName=John \
  -s lastName=Server \
  -s enabled=true

# Set password
docker exec host-keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r host-pos \
  --username john.server \
  --new-password password123

# Assign role
docker exec host-keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r host-pos \
  --uusername john.server \
  --rolename server
```

## Testing Authentication

### Get Access Token

```bash
curl -X POST "http://localhost:8080/realms/host-pos/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john.server" \
  -d "password=password123" \
  -d "grant_type=password" \
  -d "client_id=host-pos-web"
```

### Decode JWT

Use https://jwt.io to decode and inspect the token claims.

## Security Considerations

### Development Mode

Current configuration uses:
- No SSL/TLS (development only)
- Weak admin password (change for production)
- Direct Access Grants enabled (testing convenience)

### Production Checklist

- [ ] Enable SSL/TLS (`sslRequired: external`)
- [ ] Change admin credentials
- [ ] Disable Direct Access Grants
- [ ] Enable email verification
- [ ] Configure SMTP for password reset
- [ ] Set up session persistence with Redis
- [ ] Configure reverse proxy (nginx/Caddy)
- [ ] Enable audit logging
- [ ] Set up backup for PostgreSQL

## Troubleshooting

### Container Logs

```bash
docker logs host-keycloak
docker logs host-postgres
```

### Health Check

```bash
curl http://localhost:9000/health
```

### Reset Realm

```bash
# Delete realm
docker exec host-keycloak /opt/keycloak/bin/kcadm.sh delete realms/host-pos

# Re-import
docker cp keycloak/realm-host-pos.json host-keycloak:/tmp/
docker exec host-keycloak /opt/keycloak/bin/kcadm.sh create realms -f /tmp/realm-host-pos.json
```

## Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect Specification](https://openid.net/connect/)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [Auth.js SvelteKit](https://authjs.dev/reference/sveltekit)
