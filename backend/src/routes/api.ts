import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { AuthController } from '../controllers/authController';
import { CarbonController } from '../controllers/carbonController';
import { ChatbotController } from '../controllers/chatbotController';
import { GoalController } from '../controllers/goalController';
import { ActionController } from '../controllers/actionController';
import { OcrController } from '../controllers/ocrController';
import { MapController } from '../controllers/mapController';
import { GamificationController } from '../controllers/gamificationController';
import { MarketplaceController } from '../controllers/marketplaceController';
import { TeamController } from '../controllers/teamController';
import { JournalController } from '../controllers/journalController';
import { AdminController } from '../controllers/adminController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Authentication & User Profiling ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/profile', requireAuth, AuthController.getProfile);
router.post('/auth/accessibility', requireAuth, AuthController.updateAccessibility);
router.get('/auth/leaderboard', requireAuth, AuthController.getLeaderboard);

// --- Carbon Metrics Tracking & Predictions ---
router.post('/carbon/log', requireAuth, CarbonController.logActivity);
router.get('/carbon/history', requireAuth, CarbonController.getHistory);
router.get('/carbon/stats', requireAuth, CarbonController.getStats);
router.get('/carbon/predictions', requireAuth, CarbonController.getPredictions);
router.get('/carbon/plan', requireAuth, CarbonController.getWeeklyActionPlan);

// --- AI Chatbot & Learning Paths ---
router.post('/bot/chat', requireAuth, ChatbotController.chat);
router.get('/bot/history', requireAuth, ChatbotController.getHistory);
router.get('/bot/learning-path', requireAuth, ChatbotController.getLearningPath);

// --- Goal & Target Management ---
router.get('/goals', requireAuth, GoalController.getGoals);
router.post('/goals', requireAuth, GoalController.createGoal);
router.put('/goals/:goalId', requireAuth, GoalController.updateGoal);
router.get('/goals/forecast', requireAuth, GoalController.getForecast);

// --- Action Center Recommendations ---
router.get('/actions', requireAuth, ActionController.getActions);
router.post('/actions', requireAuth, ActionController.createAction);
router.put('/actions/:actionId', requireAuth, ActionController.updateActionStatus);

// --- OCR Scanner (Receipts / Energy Bills) ---
router.post('/ocr/upload', requireAuth, upload.single('file'), OcrController.uploadBillOrReceipt);
router.get('/ocr/analyses', requireAuth, OcrController.getAnalyses);

// --- Green Mapping & Nearby Locator ---
router.get('/map/route', requireAuth, MapController.planRoute);
router.get('/map/services', requireAuth, MapController.getServices);

// --- Community Challenges & Badges ---
router.get('/gamification/challenges', requireAuth, GamificationController.getChallenges);
router.post('/gamification/challenges/join', requireAuth, GamificationController.joinChallenge);
router.post('/gamification/challenges/checkin', requireAuth, GamificationController.checkInChallenge);
router.get('/gamification/badges', requireAuth, GamificationController.getBadges);

// --- Offset Marketplace & Eco Catalog ---
router.get('/marketplace/products', requireAuth, MarketplaceController.getProducts);
router.post('/marketplace/buy', requireAuth, MarketplaceController.buyOffset);
router.get('/marketplace/transactions', requireAuth, MarketplaceController.getTransactions);

// --- Teams & Family Groups ---
router.get('/teams', requireAuth, TeamController.getTeams);
router.post('/teams', requireAuth, TeamController.createTeam);
router.post('/teams/join', requireAuth, TeamController.joinTeam);
router.get('/teams/:teamId', requireAuth, TeamController.getTeamDetails);

// --- Mindful Sustainability Journal ---
router.get('/journal', requireAuth, JournalController.getJournals);
router.post('/journal', requireAuth, JournalController.logJournal);
router.get('/journal/correlation', requireAuth, JournalController.getMoodCorrelation);

// --- PDF Compilation Downloads ---
router.get('/report/pdf', requireAuth, AdminController.downloadUserReport);

// --- Administration Aggregates ---
router.get('/admin/stats', requireAuth, requireAdmin, AdminController.getPlatformStats);

export default router;
