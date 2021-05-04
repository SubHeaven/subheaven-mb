const amqp = require('amqplib/callback_api');

exports.packMessage = async msg => {
    let t = typeof msg;
    if (['string'].indexOf(t) > -1) {
        return `string:\n${msg}`;
    } else if (['object'].indexOf(t) > -1) {
        return `json:\n${JSON.stringify(msg)}`
    } else if (['number'].indexOf(t) > -1) {
        return `number:\n${msg.toString()}`
    } else {
        return t;
    }
}

exports.unpackMessage = async msg => {
    let t = msg.split(':\n')[0]
    msg = msg.split(':\n')[1]
    if (['string'].indexOf(t) > -1) {
        return msg;
    } else if (['json'].indexOf(t) > -1) {
        return JSON.parse(msg)
    } else if (['number'].indexOf(t) > -1) {
        return msg.indexOf('.') > -1 ? parseFloat(msg) : parseInt(msg)
    } else {
        return msg;
    }
}

exports.sendToQueue = async(queue, msg) => {
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', (err1, connection) => {
            if (err1) reject(err1);
            connection.createChannel(async(err2, channel) => {
                if (err2) reject(err2);

                channel.assertQueue(queue, { durable: false });

                let pack = await this.packMessage(msg);
                channel.sendToQueue(queue, Buffer.from(pack));
                console.log(`Sent: ${pack}`);
                resolve();
            });

            setTimeout(() => {
                connection.close();
            }, 500);
        });
    });

    await Promise.all([promise]);
};

exports.listenToQueue = async(queue, callback) => {
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', (err1, connection) => {
            if (err1) reject(err1);

            connection.createChannel((err2, channel) => {
                if (err2) reject(err2);

                channel.assertQueue(queue, { durable: false });

                console.log(`Waiting for messages from ${queue}. Press Ctrl + C to exit.`);

                channel.consume(queue, async msg => {
                    now = new Date();
                    msg = await this.unpackMessage(msg.content.toString());
                    if (callback) callback(msg);
                }, {
                    noAck: false
                });
                resolve();
            });
        });
    });

    await Promise.all([promise]);
};

exports.checkQueue = async(queue, callback) => {
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', (err1, connection) => {
            if (err1) reject(err1);

            connection.createChannel((err2, channel) => {
                if (err2) reject(err2);

                channel.assertQueue(queue, { durable: false });
                channel.prefetch(1);

                channel.checkQueue(queue, async(err, response) => {
                    if (err) console.error(err);
                    if (callback) callback(err, response);
                    channel.close();
                    connection.close();
                    resolve();
                });
            });
        });
    });

    await Promise.all([promise]);
};

exports.consumeOneFromQueue = async(queue_name, callback) => {
    const tools = this;
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', function(error0, connection) {
            // process.once('SIGINT', function() { connection.close(); });
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(queue_name, {
                    durable: false
                });
                channel.prefetch(1);

                channel.consume(queue_name, async(msg) => {
                    channel.cancel(msg.fields.consumerTag);
                    let unpacked = await tools.unpackMessage(msg.content.toString());
                    channel.ack(msg);
                    if (callback) callback(unpacked);
                    resolve(unpacked);
                }, {
                    noAck: false
                });
            });
            setTimeout(function() {
                connection.close();
            }, 500);
        });
    });

    await Promise.all([promise]);
};

exports.publish = async(exchange, msg) => {
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', (err1, connection) => {
            if (err1) reject(err1);

            connection.createChannel(async(err2, channel) => {
                if (err2) reject(err2);

                let pack = await this.packMessage(msg);
                channel.assertExchange(exchange, 'fanout', { durable: false });
                channel.publish(exchange, '', Buffer.from(pack));
                console.log(`Send: ${pack}`);
                resolve();
            });

            setTimeout(() => {
                connection.close();
                process.exit(0);
            }, 500);
        });
    });

    await Promise.all([promise]);
};

exports.subscript = async(exchange, callback) => {
    const promise = new Promise((resolve, reject) => {
        amqp.connect('amqp://localhost', (err1, connection) => {
            if (err1) reject(err1);
            connection.createChannel((err2, channel) => {
                if (err2) reject(err2);

                channel.assertExchange(exchange, 'fanout', { durable: false });


                channel.assertQueue('', { exclusive: true }, (err3, q) => {
                    if (err3) reject(err3);

                    console.log(`Waiting for messages from ${q.queue}. Press Ctrl + C to exit.`);
                    channel.bindQueue(q.queue, exchange, '');

                    channel.consume(q.queue, async msg => {
                        if (msg.content) {
                            let now = new Date();
                            console.log(`${now.toISOString()} => ${msg.content.toString()}`);
                            msg = await this.unpackMessage(msg.content.toString());
                            if (callback) callback(msg);
                        }
                    }, {
                        noAck: false
                    });
                });

                resolve();
            });
        });
    });

    await Promise.all([promise]);
}