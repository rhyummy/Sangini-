# Sanghini Backend - Production Implementation

## ✅ COMPLETE FILES DELIVERED

### Core Application
- `src/index.ts` - Server entry with env validation and DB connection
- `src/server.ts` - Express app with routes and middleware
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/env.ts` - Environment variable validation

### Database
- `prisma/schema.prisma` - Complete schema with User, RiskAssessment, Appointment, ChatSession, ChatMessage tables

### Routes
- `src/routes/health.ts` - Health check with DB and Gemini tests
- `src/routes/chat.ts` - AI chatbot with session management
- `src/routes/risk.ts` - Risk assessment with DB persistence
- `src/routes/appointment.ts` - Appointment CRUD with status lifecycle
- `src/routes/admin.ts` - Metrics and analytics
- `src/routes/user.ts` - User management and data deletion

### Services
- `src/services/gemini.ts` - Google Gemini AI wrapper with safety guards

### Middleware
- `src/middleware/error.ts` - Centralized error handling
- `src/middleware/rateLimit.ts` - Rate limiting (10/min chat, 100/15min general)
- `src/middleware/validate.ts` - Zod schema validation

### Utilities
- `src/seed.ts` - Database seeding script

### Documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `FAILURE_WARNINGS.md` - Critical failure points and fixes
- `README.md` - API documentation

---

## ⚠️ CRITICAL SETUP REQUIRED

The backend **WILL NOT START** until these steps are completed:

### STEP 1: Configure PostgreSQL Database

**Current State**: DATABASE_URL points to non-existent database

**Required Action**:
```bash
# Option A: Use Supabase (recommended for hackathon)
# 1. Create project at https://supabase.com
# 2. Get connection string from Settings > Database
# 3. Update .env with real connection string

# Option B: Local PostgreSQL
# Install PostgreSQL, then:
createdb sanghini
# Update DATABASE_URL in .env
```

**Update `.env` file**:
```
DATABASE_URL=postgresql://real_user:real_password@real_host:5432/real_database
```

### STEP 2: Run Prisma Migrations

**Required Commands**:
```bash
npm run prisma:generate
npm run prisma:migrate
```

**What This Does**:
- Creates database tables (User, RiskAssessment, Appointment, ChatSession, ChatMessage)
- Creates indexes for performance
- Generates Prisma Client

**What Fails Without This**:
- ❌ Server crashes on startup
- ❌ All API endpoints return 500 errors
- ❌ "PrismaClient is unable to connect" error

### STEP 3: Seed Database (Optional)

```bash
npm run seed
```

Creates demo data:
- 3 users (patients and doctor)
- 2 risk assessments
- 2 appointments
- 1 chat session with messages

### STEP 4: Verify Gemini API Key

**Current State**: `.env` has GEMINI_API_KEY configured

**Test It Works**:
```bash
npm run dev
curl http://localhost:5000/api/health
```

Check `checks.gemini` field is "connected"

---

## 🚨 FAILURE POINTS AND FIXES

### 1. "Missing required environment variables: DATABASE_URL"
**Fix**: Add valid PostgreSQL connection string to `.env`

### 2. "PrismaClient is unable to connect"
**Causes**:
- DATABASE_URL is invalid
- Database server not running
- Network/firewall blocking connection
- Wrong credentials

**Fix**: Verify database is accessible, test connection string

### 3. "The table User does not exist"
**Fix**: Run `npm run prisma:migrate`

### 4. "Cannot find module '@prisma/client'"
**Fix**: Run `npm run prisma:generate`

### 5. Chat endpoint fails with "AI service configuration error"
**Causes**:
- Invalid GEMINI_API_KEY
- API key quota exceeded
- No internet access

**Fix**: Verify API key at https://makersuite.google.com/app/apikey

### 6. Rate limit errors
**Behavior**: Returns 429 after 10 chat requests/minute
**Fix**: Expected behavior (protection against abuse)
**Disable**: Remove rate limiter from `server.ts` (not recommended)

---

## 📋 ASSUMPTIONS MADE

1. **PostgreSQL 12+** - Prisma requires modern PostgreSQL
2. **Database Permissions** - User has CREATE, ALTER, DROP permissions
3. **Network Access** - Server can reach database and Gemini API
4. **UTF-8 Encoding** - Database supports Unicode
5. **Port 5000 Available** - Can be changed via PORT env var
6. **No Authentication** - Soft user identity via userId in requests
7. **In-Memory Rate Limiting** - Resets on server restart (consider Redis for production)

---

## API ENDPOINTS

### Health Check
```
GET /api/health
Returns: { status, timestamp, checks: { database, gemini } }
Status: 200 (OK) or 503 (degraded)
```

### User Management
```
POST /api/users
Body: { name, email?, role? }

GET /api/users/:id

DELETE /api/users/:id/data (deletes all user data)
```

### Risk Assessment
```
POST /api/risk-score
Body: { userId, riskFactors: {...}, symptoms: {...} }
Returns: { id, score, level, breakdown, recommendations }

GET /api/risk-score/history/:userId
```

### Appointments
```
POST /api/appointments
Body: { userId, doctorName, date, time, notes? }

GET /api/appointments/user/:userId

PATCH /api/appointments/:id/status
Body: { status: "SCHEDULED" | "COMPLETED" | "CANCELLED" }

DELETE /api/appointments/:id
```

### Chat
```
POST /api/chat
Body: { userId, sessionId?, message }
Rate Limit: 10 requests/minute
Returns: { sessionId, response, timestamp }

GET /api/chat/sessions/:userId
```

### Admin
```
GET /api/admin/metrics
Returns: { overview, riskDistribution, appointmentsByStatus, recentAssessments }
```

---

## TESTING SEQUENCE

```bash
# 1. Start server
npm run dev

# 2. Check health
curl http://localhost:5000/api/health

# 3. Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"test@example.com"}'
# Save userId from response

# 4. Risk assessment
curl -X POST http://localhost:5000/api/risk-score \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","riskFactors":{"age":45,"familyHistory":true},"symptoms":{"lump":true}}'

# 5. Schedule appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","doctorName":"Dr. Sarah Chen","date":"2026-02-20","time":"10:00 AM"}'

# 6. Chat (requires valid Gemini key)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","message":"I am feeling anxious about my screening"}'

# 7. Admin metrics
curl http://localhost:5000/api/admin/metrics
```

Replace `USER_ID` with actual ID from step 3.

---

## PRODUCTION CHECKLIST

- [ ] Valid DATABASE_URL configured
- [ ] Prisma migrations run
- [ ] Valid GEMINI_API_KEY configured
- [ ] Health endpoint returns 200
- [ ] Database backups configured
- [ ] Error logging/monitoring setup
- [ ] Rate limiting appropriate for load
- [ ] CORS origins restricted
- [ ] Environment is NODE_ENV=production
- [ ] Database connection pool sized correctly

---

## SUPPORT

See `DEPLOYMENT.md` for detailed deployment guide
See `FAILURE_WARNINGS.md` for troubleshooting
See Prisma docs: https://www.prisma.io/docs
See Gemini docs: https://ai.google.dev/docs
