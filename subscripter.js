const queue = require('./index');

queue.subscript('logs', async msg => {
    console.log("");
    console.log("received:");
    console.log(msg);
});