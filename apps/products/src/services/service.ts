import sql from '../db';
import { CategoryCreateUpdateDto, ProductCreateUpdateDto, ProductsQueryDto } from '../types/dto';
import { Category, Product, ProductWithCategory } from '../types/models';

export const getProducts = async (query: ProductsQueryDto): Promise<ProductWithCategory[]> => {
  const { includeCategory, categoryFilter, sortColumn, sortDescending, offset, limit } = query;

  const result = await sql<ProductWithCategory[]>`;
    SELECT
      products.*
      ${
        includeCategory
          ? sql`, categories.name AS category_name, categories.description AS category_description`
          : sql``
      }
    FROM products
    ${includeCategory ? sql`JOIN categories ON products.category_id = categories.id` : sql``}
    ${categoryFilter.length > 0 ? sql`WHERE category_id in ${sql(categoryFilter)}` : sql``}
    ORDER BY ${sql(sortColumn)} ${sortDescending ? sql`DESC` : sql`ASC`}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const products = result;
  return products;
};

export const getProduct = async (id: number): Promise<ProductWithCategory> => {
  const result = await sql<ProductWithCategory[]>`
    SELECT
      products.*,
      categories.name AS category_name,
      categories.description AS category_description
    FROM products
    JOIN categories ON products.category_id = categories.id
    WHERE products.id = ${id}
  `;

  const product = result[0];
  return product;
};

export const createProduct = async (dto: ProductCreateUpdateDto): Promise<Product> => {
  const { name, description, price, categoryId } = dto;

  const result = await sql<Product[]>`
    INSERT INTO products
      (name, description, price, category_id)
    VALUES
      (${name}, ${description}, ${price}, ${categoryId})
    RETURNING *
  `;
  const product = result[0];

  return product;
};

export const updateProduct = async (id: number, dto: ProductCreateUpdateDto): Promise<Product> => {
  const { name, description, price, categoryId } = dto;

  const result = await sql<Product[]>`
    UPDATE products
    SET
      (name, description, price, category_id, modified_at) = (${name}, ${description}, ${price}, ${categoryId}, ${new Date()})
    WHERE id = ${id}
    RETURNING *
  `;

  const product = result[0];
  return product;
};

export const deleteProduct = async (id: number): Promise<number> => {
  const result = await sql<Product[]>`
      DELETE FROM products
      WHERE id = ${id}
  `;

  const affectedRows = result.count;
  return affectedRows;
};

export const getCategories = async (): Promise<Category[]> => {
  const result = await sql<Category[]>`
    SELECT * FROM categories
  `;

  const categories = result;
  return categories;
};

export const getCategory = async (id: number): Promise<Category> => {
  const result = await sql<Category[]>`
    SELECT * FROM categories
    WHERE id = ${id}
  `;

  const category = result[0];
  return category;
};

export const createCategory = async (dto: CategoryCreateUpdateDto): Promise<Category> => {
  const { name, description } = dto;

  const result = await sql<Category[]>`
    INSERT INTO categories
      (name, description)
    VALUES
      (${name}, ${description})
    RETURNING *
  `;

  const category = result[0];
  return category;
};

export const updateCategory = async (id: number, dto: CategoryCreateUpdateDto) => {
  const { name, description } = dto;

  const result = await sql<Product[]>`
    UPDATE categories
    SET
      (name, description) = ( ${name}, ${description} )
    WHERE id = ${id}
    RETURNING *
  `;

  const category = result[0];
  return category;
};

export const deleteCategory = async (id: number) => {
  const result = await sql<Product[]>`
    DELETE FROM categories
    WHERE id = ${id}
  `;

  const affectedRows = result.count;
  return affectedRows;
};
