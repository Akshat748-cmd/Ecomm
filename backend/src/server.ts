import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Server] Precious Commerce API listening on port ${config.port} (${config.nodeEnv})`);
  console.log(`[Server] Health check: http://localhost:${config.port}/health`);
  console.log(`[Server] API Prefix: http://localhost:${config.port}${config.apiPrefix}`);
});
