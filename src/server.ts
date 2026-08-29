import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
  server.close(() => {
    process.exit(1);
  });
});
