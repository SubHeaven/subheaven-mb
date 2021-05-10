#!/usr/bin/env node

const queue = require('./index');

let showHelp = async() => {
    console.log("Lista as filas e as mensagens armazenadas");
    console.log("");
    console.log("Parâmetros:");
    console.log("    list_queues = (Opcional) Nome da fila. Se não for informado mostra todas as filas");
    console.log("    --detail = (Opcional) Mostra também as mensagens da fila");
    console.log("");
    console.log("Exemplo:");
    console.log(`    node list_queues.js`);
    console.log(`    node list_queues.js --detail`);
    console.log(`    node list_queues.js "item_vendido"`);
    console.log(`    node list_queues.js "item_vendido" --detail`);
}

const runCommand = async(command) => {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(command, {
            maxBuffer: 1024 * 500
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                reject(error);
            } else if (stderr) {
                console.error(stderr);
                reject(stderr);
            } else {
                resolve(stdout);
                return stdout;
            }
        });
    });
}

const processQuery = async(only_queue = '', detail = false) => {
    let response = await runCommand("rabbitmqctl list_queues --silent");
    let resp_lines = response.split("\n");
    let dataset = [];
    for (i = 0; i < resp_lines.length; i++) {
        if (resp_lines[i] !== "") {
            dataset = [];
            let queue_name = resp_lines[i].split("\t")[0];
            let limit = parseInt(resp_lines[i].split("\t")[1]);
            if (only_queue === "" || only_queue === queue_name) {
                if (detail) {
                    if (limit > 0) {
                        await queue.listenToQueueSilent(queue_name, limit, async(err, msg) => {
                            dataset.push({
                                queue: queue_name,
                                message: msg
                            });
                            if (dataset.length === limit) console.table(dataset);
                        });
                    } else {
                        dataset.push({
                            queue: queue_name,
                            message: ''
                        });
                        console.table(dataset);
                    }
                } else {
                    console.log(`${queue_name}: ${limit}`);
                }
            }
        }
    }
};

// processQuery();

if (process.argv.length > 2) {
    if (['?', 'help', 'ajuda'].indexOf(process.argv[2]) > -1) {
        showHelp();
    } else {
        let detail = process.argv.indexOf('--detail');
        if (detail > -1) process.argv.splice(detail, 1);
        if (process.argv.length > 2) {
            const queue_name = process.argv[2];
            processQuery(queue_name, detail > -1);
        } else {
            processQuery('', detail > -1);
        }
        // queue.consumeOneFromQueue(queue_name, async msg => {
        //     console.log("");
        //     console.log("received:");
        //     console.log(typeof msg)
        //     console.log(msg);
        //     return true;
        // });
        // // debug_listen(queue_name);
    }
} else {
    processQuery();
}