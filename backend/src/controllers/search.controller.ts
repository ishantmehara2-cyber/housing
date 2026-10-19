import { Request, Response, NextFunction } from 'express';
import { propertySearchSchema, ApiResponse, PropertySearchResponse } from '@housing-clone/shared';
import { MySqlPropertySearchService } from '../services/search/mysqlPropertySearch.service';

const searchService = new MySqlPropertySearchService();

export class SearchController {
  public static async searchProperties(
    req: Request,
    res: Response<ApiResponse<PropertySearchResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedQuery = propertySearchSchema.parse(req.query);
      const searchResult = await searchService.searchProperties(validatedQuery);

      res.status(200).json({
        success: true,
        data: searchResult,
      });
    } catch (err) {
      next(err);
    }
  }
}
