import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api';
import { errorHandler } from './middleware/error';

const app = express();

// Security Hardening: Helmet sets secure HTTP headers to mitigate vulnerabilities (XSS, Clickjacking, etc.)
app.use(helmet());

// Enable Cross-Origin Resource Sharing for the frontend development port
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting to prevent brute-force attacks and resource exhaustion
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Map main API sub-router
app.use('/api', apiRouter);

// Global exception catcher middleware (OWASP Protection)
app.use(errorHandler);

export default app;
