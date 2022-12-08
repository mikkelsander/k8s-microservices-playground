export async function up(sql) {
  await sql`
    INSERT INTO categories (name, description)
    VALUES
      ('category 1', 'Category Description 1'),
      ('category 2', 'Category Description 2'),
      ('category 3', 'Category Description 3'),
      ('category 4', 'Category Description 4')
    ;
  `;

  await sql`
    INSERT INTO products (category_id, name, description, price)
    VALUES
      (1, 'Product 1', 'Product Description 1', 999),
      (1, 'Product 2', 'Product Description 2', 5),
      (1, 'Product 3', 'Product Description 3', 48),
      (1, 'Product 4', 'Product Description 4', 13),
      (1, 'Product 5', 'Product Description 5', 3123),
      (1, 'Product 6', 'Product Description 6', 13),
      (2, 'Product 7', 'Product Description 7', 3123),
      (2, 'Product 8', 'Product Description 8', 65),
      (2, 'Product 9', 'Product Description 9', 876),
      (2, 'Product 10', 'Product Description 10', 96),
      (2, 'Product 11', 'Product Description 11', 89),
      (2, 'Product 12', 'Product Description 12', 67),
      (3, 'Product 13', 'Product Description 13', 34),
      (3, 'Product 14', 'Product Description 14', 555),
      (3, 'Product 15', 'Product Description 15', 345),
      (3, 'Product 16', 'Product Description 16', 67),
      (3, 'Product 17', 'Product Description 17', 112),
      (3, 'Product 18', 'Product Description 18', 3),
      (4, 'Product 19', 'Product Description 19', 4),
      (4, 'Product 20', 'Product Description 20', 77),
      (4, 'Product 21', 'Product Description 21', 123),
      (4, 'Product 22', 'Product Description 22', 321),
      (4, 'Product 23', 'Product Description 23', 44),
      (4, 'Product 24', 'Product Description 24', 44)
    ;
`;
}

export async function down(sql) {
  await sql`
    TRUNCATE products, categories;
  `;
}
