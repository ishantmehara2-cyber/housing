import { Request, Response, NextFunction } from 'express';
import { slugParamSchema, ApiResponse, ProjectDetail } from '@housing-clone/shared';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  public static async getProjects(
    _req: Request,
    res: Response<ApiResponse<ProjectDetail[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const projects = await ProjectService.getProjects();
      res.status(200).json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  }

  public static async getProjectBySlug(
    req: Request,
    res: Response<ApiResponse<ProjectDetail>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const project = await ProjectService.getProjectBySlug(slug);

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }
}
