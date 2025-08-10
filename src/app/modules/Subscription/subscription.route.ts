import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SubscriptionControllers } from './subscription.controller';

const router = express.Router();

router.post('/', auth(UserRole.CLUB_OWNER), SubscriptionControllers.createSubscription);
router.get('/', SubscriptionControllers.getAllSubscriptions);
router.get('/:id', SubscriptionControllers.getSingleSubscription);
router.patch('/:id', auth(UserRole.CLUB_OWNER), SubscriptionControllers.updateSubscription);
router.delete('/:id', auth(UserRole.CLUB_OWNER), SubscriptionControllers.deleteSubscription);

export const SubscriptionRoutes = router;
