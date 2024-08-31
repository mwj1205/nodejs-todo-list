import express from 'express';
import Todo from '../schemas/todo.schema.js';
import Joi from 'joi';

const router = express.Router();

// 할 일 생성 API의 요청 데이터 검증을 위한 Joi 스키마 정의
const createTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

// 할 일 등록 API
router.post('/todos', async (req, res, next) => {
  try {
    // 1. 클라이언트로부터 전달받은 데이터를 가져온다.
    const validation = await createTodoSchema.validateAsync(req.body);
    const { value } = validation;

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    const todoMaxOrder = await Todo.findOne().sort('-order').exec(); // - : 내림차순

    // 3. 만약 존재한다면 현재 해야 할 일을 +1 하고, order 데이터가 존재하지 않다면, 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할 일 등록
    const todo = new Todo({ value, order });
    await todo.save();

    // 5. 해야할 일 클라이언트에게 반환

    return res.status(201).json({ todo: todo });
  } catch (error) {
    next(error);
  }
});

// 해야할 일 목록 조회 API
router.get('/todos', async (req, res, next) => {
  const todos = await Todo.find().sort('-order').exec();
  return res.status(200).json({ todos: todos });
});

// 아이디로 할 일 찾기
router.get('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const todos = await Todo.findById(todoId).exec();
  return res.status(200).json({ todos: todos });
});

// 해야할 일 순서 변경, 완료 / 해제 API
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { value, order, done } = req.body;

  // 현재 나의 order가 무엇인지
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 해야할 일 입니다.' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

// 할 일 삭제 API
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 해야할 일 정보입니다.' });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
