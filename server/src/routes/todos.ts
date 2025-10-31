import { Router } from 'express';
import {
  getTodos,
  createTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
  getTodo,
} from '../controllers/todoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTodos);
router.post('/', createTodoHandler);
router.get('/:id', getTodo);
router.put('/:id', updateTodoHandler);
router.delete('/:id', deleteTodoHandler);

export default router;

