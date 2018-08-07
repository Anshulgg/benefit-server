import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import router from './routes/index';
import mongodb from './database/mongodb';
import cors from 'cors' ;
import SocketIO from 'socket.io' ;
import http from 'http' ;
import socketioJwt from 'socketio-jwt';
import config from "./config/config";
import Chat from './models/chat' ;

const port = process.env.PORT || 5000;

let app = express();
let httpServer = http.Server(app);
const io = SocketIO(httpServer);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/', router);


var numUsers = 0;

io.use(socketioJwt.authorize({
    secret: config.secretKey,
    handshake: true
}));

io.on('connection', (socket) => {
    var addedUser = false;
    console.log('hello! name : ', socket.decoded_token.name);
    // console.log(socket.handshake.query);

    let roomName = socket.handshake.query.room;
    if (!roomName) {
        roomName = socket.decoded_token.id;
        // console.log(socket.handshake.query.room , socket.decoded_token.id);
    }
    socket.join(roomName);


    socket.on('room', (room) => {
        socket.leave(roomName);
        socket.join(room);
        roomName = room;
        console.log("Changed Room to : ", roomName);
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        console.log(data);
        // let room;
        // if (data.author === 0) {
        //     room = socket.decoded_token.id;
        // } else {
        //     room = data.room;
        // }
        // console.log(room);
        // console.log(socket.decoded_token.id);

        console.log("Room Name : ", roomName);

        let message = new Chat({
            author: data.author,
            message: data.message,
            timestamp: data.timestamp,
            room: roomName
        });
        message.save().then(saved => {
            // socket.join(`${socket.decoded_token.id}`);
            socket.broadcast.in(roomName).emit('new message', {
                message: data.message,
                author: data.author,
                timestamp: data.timestamp
            });


            // io.in(`${socket.decoded_token.id}`).emit('new message', {
            //     message: Math.random().toString(36).substring(7),
            //     author: 1
            // });
            // io.in(`${socket.decoded_token.id}`).emit('new message', {
            //
            //     message: Math.random().toString(36).substring(7),
            //     author: 2
            // });
        });

    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;

        // we store the username in the socket session for this client
        console.log('Connnected');
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            console.log('Disconnected');
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});


mongodb.getConnection()
    .then((msg) => {
        console.log(msg);
        httpServer.listen(port, () => {
            console.log(`Server running and listening in http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
