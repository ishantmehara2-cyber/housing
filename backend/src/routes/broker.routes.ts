import { Router } from 'express';
import { BrokerController } from '../controllers/broker.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

export const brokerRouter = Router();

// Public Directory Endpoints
brokerRouter.get('/directory', BrokerController.getBrokers);
brokerRouter.get('/directory/:id', BrokerController.getBrokerById);
brokerRouter.post('/directory/:id/contact', optionalAuth, BrokerController.contactBroker);

// Self Broker Portal Endpoints
brokerRouter.get('/dashboard', requireAuth, BrokerController.getBrokerDashboard);
brokerRouter.get('/properties', requireAuth, BrokerController.getBrokerProperties);
brokerRouter.get('/leads', requireAuth, BrokerController.getBrokerLeads);
brokerRouter.patch('/leads/:id/assign', requireAuth, BrokerController.assignLeadToSubAgent);
brokerRouter.patch('/leads/:id/status', requireAuth, BrokerController.updateLeadStatusByBroker);
brokerRouter.get('/team', requireAuth, BrokerController.getBrokerTeam);
brokerRouter.post('/team', requireAuth, BrokerController.addSubAgentByBroker);
brokerRouter.get('/enquiries', requireAuth, BrokerController.getBrokerEnquiries);
brokerRouter.get('/visits', requireAuth, BrokerController.getBrokerVisits);
brokerRouter.patch('/visits/:id', requireAuth, BrokerController.updateBrokerVisitStatus);
brokerRouter.get('/profile', requireAuth, BrokerController.getBrokerProfile);
brokerRouter.patch('/profile', requireAuth, BrokerController.updateBrokerProfile);
