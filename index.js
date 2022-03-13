const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// manage user id
var sockets = {};

io.on('connection', (socket) => {
    const id = socket.id;

    // sprint room events
    socket.on('room', function(room) {   
        socket.join(room);
        
        socket.on('user-join', (userId) => {
            if (userId != undefined) {
                sockets[id] = userId;
            }
        });
    
        socket.on('disconnect', () => {
            if (sockets[id] != undefined) {
                const userId = sockets[id];
                
                delete sockets[id];
                
                setTimeout(() => {
                    if (!Object.values(sockets).includes(userId)) {
                        io.emit('user-unjoin', userId);
                    }
                }, 10000);
            }
        });

        socket.on('fetchMessages', (msg) => {
            socket.broadcast.to(room).emit('fetchMessages', msg);
        });

        socket.on('fetchUsers', () => {
            socket.broadcast.to(room).emit('fetchUsers');
        });

        socket.on('fetchItens', () => {
            socket.broadcast.to(room).emit('fetchItens');
        });

        socket.on('fetchActions', () => {
            socket.broadcast.to(room).emit('fetchActions');
        });

        socket.on('fetchClearVotes', () => {
            socket.broadcast.to(room).emit('fetchClearVotes');
        });

        socket.on('fetchPlanningUsers', () => {
            io.to(room).emit('fetchPlanningUsers');
        });

        socket.on('fetchVotedItem', () => {
            io.to(room).emit('fetchVotedItem');
        });
    });
});

const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    console.log(`listening on *:${port}`);
});