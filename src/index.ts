import exitHook from 'async-exit-hook';

import logger from './library/logger';
import { start, stop } from './message-service';

start().catch(err => logger.error(err));

exitHook((callback: any) => {
  stop()
    .catch(err => logger.error(err))
    .then(() => callback());
});