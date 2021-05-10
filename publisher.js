const queue = require('./index');

// queue.publish('logs', 'Olá SubHeaven');
queue.publish('logs', { data: 'Oi' });