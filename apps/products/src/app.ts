import express, { Application, NextFunction, Request, Response } from 'express';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import { logRequest } from './middleware/request-logging';

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logRequest);

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

export default app;
