import express, { Router } from 'express';

import { getProducts } from './service';

const router: Router = express.Router();

router.get('/', async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

export default router;
