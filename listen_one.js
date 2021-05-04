const amqp = require('amqplib/callback_api');
const queue = require('./subheaven-mq');

let showHelp = async() => {
    console.log("Ouve um canal no RabbitMQ consome e mostra apenas uma mensagem da fila. Depois de consumido a mensagem é removida da fila.");
    console.log("");
    console.log("Parâmetros:");
    console.log("    queue_name = Nome da fila.");
    console.log("");
    console.log("Exemplo:");
    console.log(`    node listen.js "item_vendido"`);
}

const debug_listen = async(queue_name) => {
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

            channel.consume(queue_name, function(msg) {
                channel.cancel(msg.fields.consumerTag);
                console.log(msg.content.toString());
                channel.ack(msg);
            }, {
                noAck: false
            });
        });
        setTimeout(function() {
            connection.close();
            process.exit(0);
        }, 500);
    });
}

if (process.argv.length > 2) {
    if (['?', 'help', 'ajuda'].indexOf(process.argv[2]) > -1) {
        showHelp();
    } else {
        const queue_name = process.argv[2];
        queue.consumeOneFromQueue(queue_name, async msg => {
            console.log("");
            console.log("received:");
            console.log(typeof msg)
            console.log(msg);
            return true;
        });
        // debug_listen(queue_name);
    }
} else {
    console.log("Nome da fila não foi informada!");
    console.log("");
    showHelp();
}