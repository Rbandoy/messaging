import Rabbit from 'onewallet.library.rabbit';

export default new Rabbit({ uri: process.env.RABBITMQ_URI });
