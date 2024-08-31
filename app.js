import express from 'express';
import connect from './schemas/index.js';
import TodosRouter from './routes/todos.router.js';
import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 그냥 / 경로에서는 정의된 프론트 파일을 서빙함
app.use(express.static('./assets'));

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'Hi!' });
});

app.use('/api', [router, TodosRouter]);

app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
