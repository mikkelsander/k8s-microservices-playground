import { StartedTestContainer, GenericContainer, Wait, Network, StartedNetwork } from 'testcontainers';
import path from 'path';
import axios, { AxiosError } from 'axios';
import { ExecResult } from 'testcontainers/dist/docker/types';
import { Category, Product } from 'src/types/models';
import { CategoryCreateUpdateDto, ProductCreateUpdateDto } from 'src/types/dto';

describe('Products service api', () => {
  jest.setTimeout(1000 * 120);

  let network: StartedNetwork;
  let pgContainer: StartedTestContainer;
  let apiContainer: StartedTestContainer;
  let apiUrl: string;

  const dbConfig = {
    user: 'test',
    password: 'test',
    db: 'products',
    host: 'testdb',
    port: '5432',
  };

  beforeAll(async () => {
    network = await new Network({ name: 'test' }).start();

    pgContainer = await new GenericContainer('postgres:15.1')
      .withEnvironment({
        POSTGRES_USER: dbConfig.user,
        POSTGRES_PASSWORD: dbConfig.password,
        POSTGRES_DB: dbConfig.db,
      })
      .withName(dbConfig.host)
      .withExposedPorts(Number(dbConfig.port))
      .withNetwork(network)
      .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/))
      .start();

    const buildContext = path.join(__dirname, '..');
    const container = await GenericContainer.fromDockerfile(buildContext, 'Dockerfile.local').build();

    apiContainer = await container
      .withEnvironment({
        POSTGRES_USER: dbConfig.user,
        POSTGRES_PASSWORD: dbConfig.password,
        POSTGRES_DB: dbConfig.db,
        POSTGRES_HOST: dbConfig.host,
        POSTGRES_PORT: dbConfig.port,
      })
      .withName('testapi')
      .withExposedPorts(3000)
      .withNetwork(network)
      .withWaitStrategy(Wait.forLogMessage(/Connected successfully on port/))
      .start();

    const logs = await apiContainer.logs();
    logs.on('error', (line) => console.log(line));
    // logs.on('data', (line) => console.log(line));

    apiUrl = `http://${apiContainer.getHost()}:${apiContainer.getMappedPort(3000)}`;
  });

  afterAll(async () => {
    await pgContainer.stop();
    await apiContainer.stop();
    await network.stop();
  });

  it('can run migrations', async () => {
    const res: ExecResult = await apiContainer.exec(['npm', 'run', 'migrate', 'up']);
    expect(res.exitCode).toBe(0);
  });

  it('can fetch all products', async () => {
    const res = await axios.post(`${apiUrl}/products/query`);
    const products: Product[] = await res.data;

    expect(res.status).toBe(200);
    expect(products).toHaveLength(24); //db is seeded with 24 products
  });

  it('can fetch a product', async () => {
    const id = 1;
    const res = await axios.get(`${apiUrl}/products/${id}`);
    const product: Product = res.data;

    expect(res.status).toBe(200);
    expect(product.id).toBe(id);
    expect(product.name).toBeDefined();
    expect(product.description).toBeDefined();
    expect(product.price).toBeDefined();
    expect(product.categoryId).toBeDefined();
    expect(product.modifiedAt).toBeDefined();
    expect(product.createdAt).toBeDefined();
  });

  it('can create a product', async () => {
    const dto: ProductCreateUpdateDto = {
      name: 'test-product',
      description: 'test-description',
      price: 999,
      categoryId: 1,
    };

    const res = await axios.post(`${apiUrl}/products`, dto);
    const product: Product = res.data;

    expect(res.status).toBe(201);
    expect(product.id).toBeDefined();
    expect(product.name).toBe(dto.name);
    expect(product.description).toBe(dto.description);
    expect(product.price).toBe(dto.price);
    expect(product.categoryId).toBe(dto.categoryId);
    expect(product.modifiedAt).toBeDefined();
    expect(product.createdAt).toBeDefined();
  });

  it('can update a product', async () => {
    const id = 1;
    const dto: ProductCreateUpdateDto = {
      name: 'test-update',
      description: 'test-update',
      price: 123,
      categoryId: 2,
    };

    const res = await axios.put(`${apiUrl}/products/${id}`, dto);
    const product: Product = res.data;

    expect(res.status).toBe(200);
    expect(product).toBeDefined();
    expect(product.id).toBe(id);
    expect(product.name).toBe(dto.name);
    expect(product.description).toBe(dto.description);
    expect(product.price).toBe(dto.price);
    expect(product.categoryId).toBe(dto.categoryId);
    expect(product.modifiedAt).toBeDefined();
    expect(product.createdAt).toBeDefined();
  });

  it('can delete a product', async () => {
    const id = 1;
    const res = await axios.delete(`${apiUrl}/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.data.deletedRows).toBe(1);

    try {
      await axios.get(`${apiUrl}/products/${id}`);
    } catch (error: any) {
      const err = error as AxiosError;
      expect(err.response?.status).toBe(404);
    }
  });

  it('can fetch all categories', async () => {
    const res = await axios.get(`${apiUrl}/categories`);
    const categories: Category[] = res.data;

    expect(res.status).toBe(200);
    expect(categories).toHaveLength(4); //db is seeded with 4 categories
  });

  it('can fetch a category', async () => {
    const id = 1;
    const res = await axios.get(`${apiUrl}/categories/${id}`);
    const category: Category = res.data;

    expect(res.status).toBe(200);
    expect(category.id).toBe(id);
    expect(category.name).toBeDefined();
    expect(category.description).toBeDefined();
  });

  it('can create a category', async () => {
    const dto: CategoryCreateUpdateDto = {
      name: 'test-category',
      description: 'test-description',
    };

    const res = await axios.post(`${apiUrl}/categories`, dto);
    const category: Category = res.data;

    expect(res.status).toBe(201);
    expect(category.id).toBeDefined();
    expect(category.name).toBe(dto.name);
    expect(category.description).toBe(dto.description);
  });

  it('can update a category', async () => {
    const id = 1;
    const dto: CategoryCreateUpdateDto = {
      name: 'test-update',
      description: 'test-update',
    };

    const res = await axios.put(`${apiUrl}/categories/${id}`, dto);
    const category: Category = res.data;

    expect(res.status).toBe(200);
    expect(category).toBeDefined();
    expect(category.id).toBe(id);
    expect(category.name).toBe(dto.name);
    expect(category.description).toBe(dto.description);
  });

  it('can delete a category', async () => {
    const id = 1;

    const deleteRes = await axios.delete(`${apiUrl}/categories/${id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.data.deletedRows).toBe(1);

    try {
      await axios.get(`${apiUrl}/categories/${id}`);
    } catch (error: unknown) {
      const err = error as AxiosError;
      expect(err.response?.status).toBe(404);
    }
  });
});
