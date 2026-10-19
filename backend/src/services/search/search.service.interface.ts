import { PropertySearchQuery, PropertySearchResponse } from '@housing-clone/shared';

export interface ISearchService {
  searchProperties(query: PropertySearchQuery): Promise<PropertySearchResponse>;
}
