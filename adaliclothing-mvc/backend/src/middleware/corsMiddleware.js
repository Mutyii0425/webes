import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000', 'https://adaliclothing.vercel.app'],
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

export default cors(corsOptions);
