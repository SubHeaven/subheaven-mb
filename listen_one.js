const queue = require('./index');

let showHelp = async() => {
    console.log("Ouve um canal no RabbitMQ consome e mostra apenas uma mensagem da fila. Depois de consumido a mensagem é removida da fila.");
    console.log("");
    console.log("Parâmetros:");
    console.log("    queue_name = Nome da fila.");
    console.log("    --consume = Se informado, consome a mensagem lida.");
    console.log("");
    console.log("Exemplo:");
    console.log(`    node listen.js "item_vendido"`);
    console.log(`    node listen.js "item_vendido" --consume`);
}

if (process.argv.length > 2) {
    if (['?', 'help', 'ajuda'].indexOf(process.argv[2]) > -1) {
        showHelp();
    } else {
        let consume = process.argv.indexOf('--consume');
        if (consume > -1) process.argv.splice(consume, 1);
        consume = consume > -1
        const queue_name = process.argv[2];
        queue.consumeOneFromQueue(queue_name, async msg => {
            console.log("");
            console.log("received:");
            console.log(typeof msg)
            console.log(msg);
            return consume;
        });
    }
} else {
    console.log("Nome da fila não foi informada!");
    console.log("");
    showHelp();
}