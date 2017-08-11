Description
=======================

Puzzle game for web browsers. This webApp is a puzzle where the pieces are cubes with images on their faces. You can choose whatever image you want. There are quite different modes available to play, even multiplayer.

Developt with WebGL using [THREE.js](https://github.com/mrdoob/three.js) framework for 3D graphics.

Using [node.js](http://nodejs.org/) in server-side, with [socket.io](http://socket.io/) for multiplayer, [Express](http://expressjs.com) as main framework with [EjS](http://www.embeddedjs.com/) as template engine, and [mongoDB](https://www.mongodb.org/) as database.

The game is [here](https://magneticube.herokuapp.com/).

Usage
=======================

When you have installed [node.js](http://nodejs.org/), you can run the game like that:

```
node App.js
```

The server will listen in 8080 port unless the Environment variable 'SUBDOMAIN' is set with value 'magneticube', when the server listen in 80 port.

Don't forget to install dependencies with:

```
npm install
```

