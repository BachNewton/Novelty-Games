import { createServer } from './createServer.js';
import { Server as SocketServer } from 'socket.io';
import Player from './player.js';
import PokerGame from './pokerGame.js';

const port = process.env.PORT || 8080;

let server = createServer();
let listOfPokerRooms = [];
let io = new SocketServer(server, {
  cors: {
    origin: ['https://bachnewton.github.io', 'http://localhost:3000']
  }
});

// Function to send crash message to all connected clients
function sendCrashMessageToAllClients(error) {
  try {
    const errorMessage = `Server encountered an error and is restarting: ${error.message || error}`;
    console.error("CRASH DETECTED:", errorMessage);
    console.error("Stack trace:", error.stack || "No stack trace available");

    if (io) {
      io.emit('message', errorMessage);
      io.emit('serverCrash', { message: errorMessage, timestamp: new Date().toISOString() });
    }
  } catch (err) {
    console.error("Failed to send crash message to clients:", err);
  }
}

// Function to restart the server
function restartServer() {
  console.log("Restarting server...");

  try {
    // Close all socket connections
    if (io) {
      io.disconnectSockets(true);
      io.close();
    }

    // Close the HTTP server
    if (server) {
      server.close(() => {
        console.log("Previous server closed");
      });
    }
  } catch (err) {
    console.error("Error during server shutdown:", err);
  }

  // Clear game state
  listOfPokerRooms = [];

  // Recreate server and socket.io
  setTimeout(() => {
    try {
      server = createServer();
      io = new SocketServer(server, {
        cors: {
          origin: ['https://bachnewton.github.io', 'http://localhost:3000']
        }
      });

      // Reinitialize socket handlers
      initializeSocketHandlers();

      // Restart listening
      server.listen(port, () => {
        console.log("Server restarted on port", port);
      });

      server.on('error', (err) => {
        console.log("Server error: ", err);
        handleServerError(err);
      });
    } catch (err) {
      console.error("Failed to restart server:", err);
      // If restart fails, exit and let process manager handle it
      process.exit(1);
    }
  }, 1000); // Wait 1 second before restarting
}

// Function to handle server errors
function handleServerError(error) {
  sendCrashMessageToAllClients(error);
  restartServer();
}

// Global error handlers
process.on('uncaughtException', (error) => {
  handleServerError(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  handleServerError(reason);
});

// Initialize socket event handlers
function initializeSocketHandlers() {

  io.on('connection', (sock) => {
    //inside connect
    console.log("someone connected, sock ID is: " + sock.id);

    sock.on('test', (text) => {
      try {
        console.log(text);
      } catch (error) {
        console.error("Error in test handler:", error);
        handleServerError(error);
      }
    });

    sock.on('joinAttempt', ({ username, stacksize, lobbyname, password }) => {
      try {
        console.log(username + " is attempting to join lobby: " + lobbyname);
        var gameFound = false;
        for (var i = 0; i < listOfPokerRooms.length; i++) {
          if (listOfPokerRooms[i].getGameID() == lobbyname) {
            gameFound = true;
            if (listOfPokerRooms[i].checkIfNameIsInGame(username)) {
              io.to(sock.id).emit('badJoin', "Someone already is using this name");
            }
            else if (listOfPokerRooms[i].getPassword() != password) {
              io.to(sock.id).emit('badJoin', "Incorrect password for the lobby: " + lobbyname);
            }
            else if (stacksize <= 0) {
              io.to(sock.id).emit('badJoin', "Stack is less than 0, please try again");
            }
            else {
              io.to(sock.id).emit('goodJoin');
            }
          }
        }
        if (!gameFound) {
          console.log(username + " attempted to join lobby: " + lobbyname + ", but lobby was not found. :L");
          io.to(sock.id).emit('badJoin', "Lobby with name: " + lobbyname + " not found. :(");
        }
      } catch (error) {
        console.error("Error in joinAttempt handler:", error);
        handleServerError(error);
      }
    });

    sock.on('createAttempt', ({ username, stacksize, lobbyname, smallBlind, bigBlind, password }) => {
      try {
        var gameCreated = false;
        for (var i = 0; i < listOfPokerRooms.length; i++) {
          if (listOfPokerRooms[i].getGameID() == lobbyname) {
            gameCreated = true;
          }
        }

        if (gameCreated == true) {
          io.to(sock.id).emit('badCreate', "The lobby: " + lobbyname + " has already been created");
        }
        else if (stacksize <= 0) {
          io.to(sock.id).emit('badCreate', "Invalid Default stack size, please try again");
        }
        else if (smallBlind > bigBlind) {
          io.to(sock.id).emit('badCreate', "Invalid small/big blind set up");
        }
        else {
          io.to(sock.id).emit('goodCreate');
          //console.log(username + " successfully created a new Lobby with ID: " + lobbyname);
        }
      } catch (error) {
        console.error("Error in createAttempt handler:", error);
        handleServerError(error);
      }
    });


    sock.on('createRoom', ({ username, stacksize, lobbyname, smallBlind, bigBlind, password }) => {
      try {
        var theGame = new PokerGame(lobbyname);
        theGame.smallBlind = Number(smallBlind);
        theGame.bigBlind = Number(bigBlind);
        theGame.password = password;
        theGame.defaultStackSize = Number(stacksize);
        console.log("New game created with ID: " + lobbyname);
        listOfPokerRooms.push(theGame);
        // const user = new player(username, stacksize, sock.id, lobbyname);

        // //Actually join the room
        // sock.join(user.getRoom());

        // //console.log(user);
        // theGame.playerJoin(user);

        //Send users client the room name and info so it can display
        // io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
        // io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
        // io.to(user.getRoom()).emit('message', theGame.getCurrentUser(sock.id).getName() + " is now spectating...");
      } catch (error) {
        console.error("Error in createRoom handler:", error);
        handleServerError(error);
      }
    });

    sock.on('joinRoom', (arrLobbynameUserNameStackSize) => {
      try {

        //Find lobby for user
        var lobbyname = arrLobbynameUserNameStackSize[0];
        var username = arrLobbynameUserNameStackSize[1];
        var stacksize = Number(arrLobbynameUserNameStackSize[2]);

        let theGame = null;
        for (var i = 0; i < listOfPokerRooms.length; i++) {
          if (listOfPokerRooms[i].getGameID() == lobbyname) {
            theGame = listOfPokerRooms[i];
            console.log("Found game: " + lobbyname);
          }
        }

        const user = new Player(username, stacksize, sock.id, lobbyname);

        // //Create new game
        // if(!isCreated)
        // {
        //     theGame = new PokerGame(lobbyname);
        //     console.log("New game created with ID: " + lobbyname);
        //     listOfPokerRooms.push(theGame);
        // }


        console.log(username + "(" + sock.id + ") joined: " + lobbyname);


        //check if the game has already started, if so  they cant click button
        if (theGame.getBegun()) {
          sock.emit('gameBegun');
        }

        //Actually join the room
        sock.join(user.getRoom());

        //console.log(user);
        theGame.playerJoin(user);

        // Check if game should be restarted (all players had disconnected)
        if (theGame.shouldRestartGame()) {
          console.log("Player joined after all players disconnected - restarting game");
          theGame.restartGame(io);
        }
        // Check if we need to restart the hand (active hand with only 1 player)
        else if (theGame.shouldRestartHand()) {
          console.log("New player joined with only 1 player in hand - restarting hand immediately");
          io.to(theGame.getGameID()).emit('message', "A new player has joined - restarting the hand");
          theGame.restartHandImmediately();
        }

        //Send users client the room name and info so it can display'
        io.to(user.getRoom()).emit('roomUsers', { room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes() });
        io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
        io.to(user.getRoom()).emit('message', theGame.getCurrentUser(sock.id).getName() + " is now spectating...");
      } catch (error) {
        console.error("Error in joinRoom handler:", error);
        handleServerError(error);
      }
    });


    sock.on('disconnect', () => {
      try {
        console.log("someone disconnected, sock ID was: " + sock.id);

        //Going through array of games to see if the sock was in any of them
        var theGame = getGameFromSockID(sock.id);

        if (theGame != null) {
          const user = theGame.getCurrentUser(sock.id);

          if (user != null) {
            // Check if there's an active hand and handle disconnection
            const hand = theGame.returnHand();
            if (hand != null && !hand.handComplete) {
              hand.handlePlayerDisconnect(sock.id);
            }

            io.to(theGame.getGameID()).emit("message", theGame.getCurrentUser(sock.id).getName() + " has left the channel")
            console.log(theGame.getCurrentUser(sock.id).getName() + " has left the channel");
            theGame.playerLeave(sock.id);

            // Check if all players have disconnected
            if (theGame.getTotalPlayers() == 0 && theGame.getBegun()) {
              theGame.endGameDueToNoPlayers(io);
            }

            io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
            io.to(user.getRoom()).emit('roomUsers', { room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes() });
          }
        }
      } catch (error) {
        console.error("Error in disconnect handler:", error);
        handleServerError(error);
      }
    });

    sock.on('message', (text) => {
      try {
        var theGame = getGameFromSockID(sock.id);
        if (theGame) {
          io.to(theGame.getGameID()).emit("message", text);
        }
      } catch (error) {
        console.error("Error in message handler:", error);
        handleServerError(error);
      }
    });

    sock.on('audio', (name) => {
      try {
        var theGame = getGameFromSockID(sock.id);
        if (theGame) {
          io.to(theGame.getGameID()).emit("audio", name);
        }
      } catch (error) {
        console.error("Error in audio handler:", error);
        handleServerError(error);
      }
    });


    var interval = null;
    //setTimeout(function(){ playermove = "f"; }, turnTime);

    //when someone hits start game
    sock.on('startGame', () => {
      try {
        //console.log(io.sockets.clients());
        var theGame = null;
        for (var i = 0; i < listOfPokerRooms.length; i++) {
          if (listOfPokerRooms[i].checkIfSockIDisInGame(sock.id)) {
            theGame = listOfPokerRooms[i];
            listOfPokerRooms[i].setBegun(true);
          }
        }

        if (theGame) {
          console.log("Someone has started the game in: " + theGame.getGameID());
          io.to(theGame.getGameID()).emit('gameBegun');
          theGame.setBegun(true);

          //the game has begun so the game goes in here


          //Starting a new poker hand:
          let handOfPoker = theGame.newHand();




          //io.to(theGame.getPlayerAt(theGame.getDealerIdx()).getSock()).emit('yourTurn', theGame.getTurnTime());
          //theGame.getPlayerAt(theGame.getDealerIdx()).setValTurn


          //Sending clients the players hands


          //var currPlayer = theGame.getPlayerFromSockID(sock);
          // currPlayer.setTurn(true);
        }
      } catch (error) {
        console.error("Error in startGame handler:", error);
        handleServerError(error);
      }
    });



    //when they submit their turn

    sock.on('playerTurn', (turnVariable) => {
      try {
        var turnVar = turnVariable;
        let theGame = getGameFromSockID(sock.id);
        if (!theGame) {
          console.error("Game not found for socket:", sock.id);
          return;
        }

        let hand = theGame.returnHand();
        if (!hand) {
          console.error("No active hand for game:", theGame.getGameID());
          return;
        }

        let player = hand.getCurrPlayer();
        if (!player) {
          console.error("No current player in hand");
          return;
        }

        //if valid option
        if (hand.validOption(turnVar)) {
          //console.log("Player has chosen a valid option");
          io.to(player.getSock()).emit('validOption');
          player.setValTurn(turnVar);
          //Changes player to check if they autofolded where they could have checked
          if ((player.getValTurn() == "autoFold" && hand.getCurrBet() == 0) || (player.getValTurn() == "autoFold" && hand.getCurrBet() == player.getCurrMoneyInPot())) {
            player.setValTurn("check");
            turnVar = "check";
          }
          console.log(player.getName() + " has chosen action: " + player.getValTurn());
          hand.playerTurn(turnVar);
        }
      } catch (error) {
        console.error("Error in playerTurn handler:", error);
        handleServerError(error);
      }
    });
  });
}

function getGameFromSockID(id) {
  for (var i = 0; i < listOfPokerRooms.length; i++) {
    if (listOfPokerRooms[i].checkIfSockIDisInGame(id)) {
      return listOfPokerRooms[i];
    }
  }
  return null;
}

// Initialize the server
initializeSocketHandlers();

server.on('error', (err) => {
  console.log("Server error: ", err);
  handleServerError(err);
});

server.listen(port, () => {
  console.log("Server started on port", port);
});

export function getio() {
  return io;
}
