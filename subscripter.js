const queue = require('./subheaven-mq');

queue.subscript('logs', async msg => {
    console.log("");
    console.log("received:");
    console.log(msg);
});