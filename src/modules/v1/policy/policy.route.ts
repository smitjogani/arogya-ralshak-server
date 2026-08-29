import { Router } from 'express';
import { PolicyController } from './policy.controller';
import { validateRequest } from '../../../../core/middlewares/validation.middleware';
import { authGuard } from '../../../../core/middlewares/auth.middleware';
import { createPolicySchema, updatePolicySchema } from './dto/policy.dto';

const router = Router();
const policyController = new PolicyController();

router.use(authGuard);

router.post('/', validateRequest(createPolicySchema), policyController.createPolicy);
router.get('/', policyController.getPolicies);
router.get('/:id', policyController.getPolicyById);
router.patch('/:id', validateRequest(updatePolicySchema), policyController.updatePolicy);
router.delete('/:id', policyController.deletePolicy);

export default router;
