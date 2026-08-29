import { Router } from 'express';
import authRoutes from './auth/auth.route';
import analysisRoutes from './analysis/analysis.route';
import policyRoutes from './policy/policy.route';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/analyses', analysisRoutes);
v1Router.use('/policies', policyRoutes);

export default v1Router;
