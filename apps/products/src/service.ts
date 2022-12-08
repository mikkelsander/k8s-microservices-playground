import sql from './db';

export const getProducts = async () => {
  const products = await sql<any[]>`SELECT * FROM products`;
  return products;
};

export const createProduct = async () => {
  return null;
};

export const updateProduct = async () => {
  return null;
};

export const deleteProduct = async () => {
  return null;
};
