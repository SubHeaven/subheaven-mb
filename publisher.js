const queue = require('./subheaven-mq');

// queue.publish('logs', 'Olá SubHeaven');
queue.publish('logs', { data: 'Oi' });