# CRITICAL FAILURE WARNINGS

## 1. DATABASE_URL MUST BE CONFIGURED

**CURRENT STATUS**: ❌ DATABASE_URL is set to a placeholder value

**WHAT WILL FAIL**:
- Server will NOT start
- All database operations will fail
- Prisma migrations cannot run

**WHY IT WILL FAIL**:
The DATABASE_URL in .env file points to a non-existent PostgreSQL database.

**HOW TO FIX**:

### Option A: Use Supabase (Recommended)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy "Connection String" (URI format)
5. Replace [YOUR-PASSWORD] with your database password
6. Update .env:
```
DATABASE_URL=postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Option B: Local PostgreSQL
1. Install PostgreSQL 12+
2. Create database: `createdb sanghini`
3. Update .env:
```
DATABASE_URL=postgresql://localhost:5432/sanghini
```

---

## 2. PRISMA MIGRATIONS NOT RUN

**CURRENT STATUS**: ❌ Database schema not created

**WHAT WILL FAIL**:
- All API endpoints will return 500 errors
- Database queries will fail with "table does not exist"

**WHY IT WILL FAIL**:
Prisma schema has not been applied to the database.

**HOW TO FIX**:
```bash
# After setting valid DATABASE_URL:
npm run prisma:generate
npm run prisma:migrate
```

---

## 3. GEMINI_API_KEY NOT CONFIGURED

**CURRENT STATUS**: ⚠️  API key is placeholder

**WHAT WILL FAIL**:
- POST /api/chat endpoint will fail
- AI responses will not work
- Health check will show gemini as "disconnected"

**WHY IT WILL FAIL**:
Gemini API requires a valid API key.

**HOW TO FIX**:
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Update .env:
```
GEMINI_API_KEY=AIzaSy...your_actual_key
```

---

## 4. REQUIRED SETUP SEQUENCE

**STEP 1**: Configure DATABASE_URL in .env
**STEP 2**: Run `npm run prisma:generate`
**STEP 3**: Run `npm run prisma:migrate`
**STEP 4**: Add GEMINI_API_KEY to .env
**STEP 5**: Run `npm run dev`
**STEP 6**: Verify with `curl http://localhost:5000/api/health`

---

## 5. ASSUMPTIONS MADE

1. PostgreSQL version is 12 or higher
2. Database user has CREATE TABLE permissions
3. Network allows connections to database
4. Gemini API has no rate limits blocking requests
5. Server has internet access for external API calls
6. Port 5000 is available and not blocked by firewall

---

## 6. TESTING WITHOUT DATABASE

**NOT POSSIBLE**. This implementation requires PostgreSQL.
The old in-memory version has been replaced.

If you need to test without database:
- Revert to previous commit, OR
- Mock Prisma client in tests

---

## 7. HEALTH CHECK BEHAVIOR

Endpoint: GET /api/health

**Returns 200** when:
- Database connected
- Gemini API reachable

**Returns 503** when:
- Database disconnected, OR
- Gemini API unreachable

**Example healthy response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T11:20:00.000Z",
  "service": "sanghini-backend",
  "checks": {
    "database": "connected",
    "gemini": "connected"
  }
}
```

---

## IMMEDIATE NEXT STEPS

1. ⚠️  Add real DATABASE_URL to .env
2. ⚠️  Run `npm run prisma:generate`
3. ⚠️  Run `npm run prisma:migrate`
4. ⚠️  Add real GEMINI_API_KEY to .env
5. ✓ Run `npm run dev`
6. ✓ Test: `curl http://localhost:5000/api/health`
