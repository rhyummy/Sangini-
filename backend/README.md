# Sanghini Backend API

## Setup

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Chat
```
POST /api/chat
Body: { message: string, history?: Array<{role: string, message: string}> }
```

### Risk Assessment
```
POST /api/risk-score
Body: { riskFactors: object, symptoms: object }
```

### Appointments
```
GET /api/appointments
POST /api/appointments
GET /api/appointments/:id
DELETE /api/appointments/:id
```
