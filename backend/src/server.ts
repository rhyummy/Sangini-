import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import chatRouter from './routes/chat';
import riskRouter from './routes/risk';
import appointmentRouter from './routes/appointment';
import adminRouter from './routes/admin';
import userRouter from './routes/user';
import { errorHandler } from './middleware/error';
import { generalRateLimiter } from './middleware/rateLimit';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(generalRateLimiter);

app.get('/', (req, res) => {
  res.json({
    service: 'Sanghini Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/risk-score', riskRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);
