export type { Media, MonthlyRecommendation, MediaType, Status } from "@prisma/client";

export interface ExternalMedia {
  externalId: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
}

export interface PaginatedResponse {
  items: ExternalMedia[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
