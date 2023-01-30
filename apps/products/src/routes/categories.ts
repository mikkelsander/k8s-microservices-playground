import express, { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { CategoryCreateUpdateDto } from '../types/dto';

import { getCategories, createCategory, updateCategory, deleteCategory, getCategory } from '../services/service';
import { validateRequest } from '../middleware/request-validation';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send(error.message);
  }
});

router.get('/:id', param('id').isNumeric(), validateRequest, async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);

  try {
    const category = await getCategory(id);

    if (!category) {
      return res.status(404).send();
    }

    return res.status(200).json(category);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).send(error.message);
  }
});

router.post(
  '/',
  body('name').isString(),
  body('description').isString(),
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    const dto = req.body as CategoryCreateUpdateDto;

    try {
      const category = await createCategory(dto);
      return res.status(201).json(category);
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
  validateRequest,
  async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);
    const dto = req.body as CategoryCreateUpdateDto;

    try {
      const category = await updateCategory(id, dto);
      return res.status(200).json(category);
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
      const deletedRows = await deleteCategory(id);
      return res.status(200).json({ deletedRows: deletedRows });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).send();
    }
  },
);

export default router;
