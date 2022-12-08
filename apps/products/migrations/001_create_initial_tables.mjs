export async function up(sql) {
  await sql`
    CREATE TABLE categories (
      id INT primary key GENERATED ALWAYS AS IDENTITY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(1000) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE products (
      id INT primary key GENERATED ALWAYS AS IDENTITY,
      category_id INT,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(1000) NOT NULL,
      price INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_category
        FOREIGN KEY(category_id) 
	        REFERENCES categories(id)
          ON DELETE SET NULL
    );
  `;

  await sql`
    CREATE OR REPLACE FUNCTION update_modified_at_column()   
      RETURNS TRIGGER 
      LANGUAGE PLPGSQL
    AS $$
    BEGIN
        NEW.modified_at = now();
        RETURN NEW;   
    END;
    $$;
  `;

  await sql`
    CREATE TRIGGER update_modified_at_column
      BEFORE UPDATE
      ON products
      FOR EACH ROW
      EXECUTE PROCEDURE update_modified_at_column();
  `;
}

export async function down(sql) {
  await sql`
    DROP TABLE products;
  `;

  await sql`
    DROP TABLE categories;
  `;

  await sql`
    DROP FUNCTION update_modified_at_column();
  `;
}
