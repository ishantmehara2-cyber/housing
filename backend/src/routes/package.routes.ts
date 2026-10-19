import { Router } from 'express';
import { PackageController } from '../controllers/package.controller';

export const packageRouter = Router();

packageRouter.get('/', PackageController.getActivePackages);
