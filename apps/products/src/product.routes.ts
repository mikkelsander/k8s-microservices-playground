import express, { Router } from 'express';

import { getProducts } from './product.service';

const router: Router = express.Router();

router.get('/', async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

export default router;
