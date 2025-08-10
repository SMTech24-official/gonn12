import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SubscriptionPlanControllers } from './subscriptionPlan.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), SubscriptionPlanControllers.createSubscriptionPlan);
router.get('/', SubscriptionPlanControllers.getAllSubscriptionPlans);
router.get('/:id', SubscriptionPlanControllers.getSingleSubscriptionPlan);
router.patch('/:id', auth(UserRole.CLUB_OWNER), SubscriptionPlanControllers.updateSubscriptionPlan);
router.delete('/:id', auth(UserRole.CLUB_OWNER), SubscriptionPlanControllers.deleteSubscriptionPlan);

export const SubscriptionPlanRoutes = router;
