import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import router from './routes/index';
import mongodb from './database/mongodb';
import cors from 'cors' ;
import SocketIO from 'socket.io' ;
import http from 'http' ;
import socketioJwt from 'socketio-jwt'
import config from "./config/config";
import Chat from './models/chat' ;

const port = process.env.PORT || 5000;

let app = express();
let httpServer = http.Server(app);
const io = SocketIO(httpServer);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/', router);

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;

        // we store the username in the socket session for this client
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

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

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
