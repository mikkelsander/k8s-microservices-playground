import express, { Router, Request, Response } from 'express';
import { body, check, param, query } from 'express-validator';
import { CategoryCreateUpdateDto, ProductCreateUpdateDto, ProductsQueryDto } from '../types/dto';

import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../services/service';
import { validateRequest } from '../middleware/request-validation';

const router: Router = express.Router();

router.post(
  '/query',
  body('categoryFilter').isArray().optional(),
  body('categoryFilter.*').isNumeric(),
  body('includeCategory').isBoolean().optional(),
  body('sortColumn').isString().optional(),
  body('sortDescending').isBoolean().optional(),
  body('limit').isNumeric().optional(),
  body('offset').isNumeric().optional(),
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const defaultValues: ProductsQueryDto = {
        categoryFilter: [],
        includeCategory: false,
        sortColumn: 'id',
        sortDescending: false,
        limit: 100,
        offset: 0,
      };

      const query: ProductsQueryDto = { ...defaultValues, ...req.body };
      const products = await getProducts(query);

      return res.status(200).json(products);
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).send(error.message);
    }
  },
);

router.get('/:id', param('id').isNumeric(), validateRequest, async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);

  try {
    const product = await getProduct(id);

    if (!product) {
      return res.status(404).send();
    }

    return res.status(200).json(product);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send(error.message);
  }
});

router.post(
  '/',
  body('name').isString(),
  body('description').isString(),
  body('price').isNumeric().toInt(),
  body('categoryId').isNumeric(),
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    const dto = req.body as ProductCreateUpdateDto;

    try {
      const product = await createProduct(dto);
      return res.status(201).json(product);
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).send(error.message);
    }
  },
);

router.put(
  '/:id',
  param('id').isNumeric(),
  body('name').isString(),
  body('description').isString(),
  body('price').isNumeric(),
  body('categoryId').isNumeric(),
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);
    const dto = req.body as ProductCreateUpdateDto;

    try {
      const product = await updateProduct(id, dto);
      return res.status(200).json(product);
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).send();
    }
  },
);

router.delete(
  '/:id',
  param('id').isNumeric(),
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);

    try {
      const deletedRows = await deleteProduct(id);
      return res.status(200).json({ deletedRows: deletedRows });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).send();
    }
  },
);

export default router;
