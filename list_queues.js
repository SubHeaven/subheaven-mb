#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const queue = require('./index');

let showHelp = async() => {
    console.log("Ouve um canal no RabbitMQ consome e mostra apenas uma mensagem da fila. Depois de consumido a mensagem é removida da fila.");
    console.log("");
    console.log("Parâmetros:");
    console.log("    queue_name = Nome da fila.");
    console.log("");
    console.log("Exemplo:");
    console.log(`    node listen.js "item_vendido"`);
}

if (process.argv.length > 2) {
    if (['?', 'help', 'ajuda'].indexOf(process.argv[2]) > -1) {
        showHelp();
    } else {
        const queue_name = process.argv[2];
        queue.listQueues(queue_name, async msg => {
            console.log("");
            console.log("received:");
            console.log(typeof msg)
            console.log(msg);
            return true;
        });
    }
} else {
    console.log("Nome da fila não foi informada!");
    console.log("");
    showHelp();
}