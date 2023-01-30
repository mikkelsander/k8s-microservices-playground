export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  modifiedAt: Date;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface ProductWithCategory {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  modifiedAt: Date;
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
}
