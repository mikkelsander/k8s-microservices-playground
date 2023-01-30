export interface ProductsQueryDto {
  includeCategory: boolean;
  categoryFilter: number[];
  sortColumn: string;
  sortDescending: boolean;
  limit: number;
  offset: number;
}

export interface ProductCreateUpdateDto {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

export interface CategoryCreateUpdateDto {
  name: string;
  description: string;
}
