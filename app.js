const { EventEmitter } = require('events');
const express = require('express');
const app = express();
const dgram = require('dgram');
const WebSocket = require('ws'); // Import WebSocket

const emitter = new EventEmitter();
let formattedData = [[0, 0, 0, 0, 0]];

function formatReceivedData(dataBuffer) {
    const formattedData = [];
    let temp = [];
    let count = 0;
    for (let i = 0; i < dataBuffer.length; i += 4) { // Read floats (4 bytes each)
        const floatValue = dataBuffer.readFloatLE(i); // Assuming little-endian encoding
        const roundedValue = parseFloat(floatValue.toFixed(2)); // Round to 2 decimal places
        temp.push(roundedValue);
        count++;
        if (count === 5) {
            formattedData.push(temp);
            break; // Exit the loop after pushing 5 elements
        }
    }
    return formattedData;
}


app.use(express.static('public'));

const udpServer = dgram.createSocket('udp4');
udpServer.on('message', (msg, rinfo) => {
    formattedData = formatReceivedData(msg);
    emitter.emit('dataReady', formattedData || [[0, 0, 0, 0, 0]]);
    console.log(`UDP    -   ${rinfo.address}:${rinfo.port}:       ${formattedData}`);
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`\nUDP server listening on ${address.address}:${address.port}`);
});

udpServer.bind(3001);

const wss = new WebSocket.Server({ port: 8080 }); // Define WebSocket server

wss.on('connection', function connection(ws) {
    console.log('Client connected');
});

app.get('/formattedData', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the current formattedData array when requested
    res.write('data: ' + JSON.stringify(formattedData) + '\n\n');

    const sendSSE = (data) => {
        res.write('data: ' + JSON.stringify(data) + '\n\n');
    };

    emitter.on('dataReady', sendSSE);

    res.on('close', () => {
        emitter.off('dataReady', sendSSE);
    });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`\nServer is running on http://${HOST}:${PORT}\n`);
});
