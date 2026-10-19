import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

export const projectRouter = Router();

projectRouter.get('/projects', ProjectController.getProjects);
projectRouter.get('/projects/:slug', ProjectController.getProjectBySlug);
