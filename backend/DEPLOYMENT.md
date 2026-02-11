# Deployment & Setup Guide

## CRITICAL WARNINGS

### 1. DATABASE_URL Configuration
**FAILURE POINT**: If DATABASE_URL is not a valid PostgreSQL connection string, the application will crash on startup.

**Required format**:
```
postgresql://username:password@host:port/database?schema=public
```

**For Supabase**:
1. Go to Settings > Database
2. Copy the Connection String (URI format)
3. Replace [YOUR-PASSWORD] with your actual database password
4. Add to .env file

**Test database connection**:
```bash
npx prisma db pull
```
If this fails, your DATABASE_URL is invalid.

---

### 2. Prisma Migration Required
**FAILURE POINT**: Server will fail if Prisma schema is not migrated to database.

**Required steps**:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or manually
npx prisma migrate dev --name init
```

**If migrations fail**:
- Check DATABASE_URL is correct
- Ensure database is accessible
- Check firewall/network settings
- Verify PostgreSQL version (12+)

---

### 3. GEMINI_API_KEY Configuration
**FAILURE POINT**: Chatbot endpoints will fail if API key is invalid.

**How to get API key**:
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to .env: `GEMINI_API_KEY=your_key_here`

**Test Gemini connection**:
```bash
curl http://localhost:5000/api/health
```
Check `checks.gemini` field in response.

---

### 4. First-Time Setup Checklist

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with real values

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database (optional)
npm run seed

# 6. Start server
npm run dev
```

---

### 5. Common Errors

**Error**: `PrismaClient is unable to connect`
- **Fix**: Check DATABASE_URL format and database is running

**Error**: `GEMINI_API_KEY environment variable is not set`
- **Fix**: Add valid API key to .env file

**Error**: `Missing required environment variables`
- **Fix**: Ensure .env has DATABASE_URL and GEMINI_API_KEY

**Error**: `The table `User` does not exist in the current database`
- **Fix**: Run `npx prisma migrate dev`

---

### 6. Production Deployment

**Environment variables required**:
- DATABASE_URL (PostgreSQL connection string)
- GEMINI_API_KEY (Google AI API key)
- PORT (optional, defaults to 5000)
- NODE_ENV=production

**Build steps**:
```bash
npm run build
npm start
```

**Health check endpoint**:
```
GET /api/health
```

Status codes:
- 200: All systems operational
- 503: Database or Gemini unavailable

---

### 7. Rate Limiting

- Chat endpoint: 10 requests/minute per IP
- General endpoints: 100 requests/15 minutes per IP

**To disable** (development only):
Remove rate limiter middleware from server.ts

---

### 8. Database Schema Changes

When modifying schema.prisma:

```bash
# Create migration
npx prisma migrate dev --name your_change_name

# Regenerate client
npx prisma generate

# Restart server
```

---

### 9. Assumptions Made

1. PostgreSQL database is version 12 or higher
2. Database user has CREATE, ALTER, DROP permissions
3. Gemini API key has no rate limits or has sufficient quota
4. Server has internet access for Gemini API calls
5. UTF-8 encoding is supported by database
6. Timezone is handled by application (timestamps are ISO strings)

---

### 10. Testing Checklist

```bash
# Health check
curl http://localhost:5000/api/health

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'

# Risk assessment
curl -X POST http://localhost:5000/api/risk-score \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","riskFactors":{"age":45},"symptoms":{"lump":true}}'

# Chat (requires valid Gemini key)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","message":"Hello"}'
```

Replace USER_ID with actual user ID from create user response.
