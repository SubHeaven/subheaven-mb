const json5 = require('json5');
const queue = require('./index');

let showHelp = async() => {
    console.log("Parâmetros:");
    console.log("    queue_name = Nome da fila.");
    console.log("    message = Mensagem a ser enviada a fila.");
    console.log("");
    console.log("Exemplo:");
    console.log(`    node send.js "item_vendido" codigo=125 quant=2 uf=GO`);
    console.log("Se a mensagem for iniciada com a tag -json então o resto da mensagem será enviada como um objeto json. Nesse caso os campos textos devem ser marcados com aspas simples (')");
    console.log(`    node send.js "item_vendido" -json { codigo: 125, quant: 2, uf: 'GO' }`);
}

if (process.argv.length > 2) {
    if (process.argv.length > 3) {
        const params = process.argv;
        const queue_name = process.argv[2];
        params.splice(0, 3);
        if (params[0] == '-json') {
            params.splice(0, 1);
            try {
                console.log("");
                console.log(params.join(' '));
                console.log("");
                let data = json5.parse(params.join(' '));
                queue.sendToQueue(queue_name, data);
            } catch (e) {
                console.log("Erro ao ler o json informado");
                showHelp();
            }
        } else {
            queue.sendToQueue(queue_name, params.join(' '));
        }
    } else {
        console.log("A mensagem não foi informada!");
        console.log("");
        showHelp();

    }
} else {
    console.log("Nome da fila não foi informada!");
    console.log("");
    showHelp();
}