Blindtest
=========

Blindtest is a multiplayer musical game (up to 16 simultaneous players). This is a very early version and surely contains bugs.

This project was initially made for the BeMyApp Deezer contest (48h hackathon).

Gameplay
--------
* The main screen plays a 30sec audio sample of a random song
* 4 possible answers are displayed
* with their mobile phone, players have to guess who is the singer of the song

Installing
----------
* Get the source `git clone git://github.com/mauricesvay/Blindtest.git`
* `cd Blindtest`
* Install dependencies (socket.io, express, sqlite3) with `npm install .`

Starting the game
-----------------
* `node app.js`
* open `http://localhost:8080/spectate` in your browser. It is now the main screen.
* each player can now join the game at `http://MAIN_SCREEN_IP_ADDRESS:8080/`
* when all players are ready, you can start the game on the main screen. 

Technical details
-----------------
* Audio samples and tracks info come from Deezer API
* Songs are picked randomly among french charts (1956-2012)
* Real time connection is made with socket.io
* The app has been tested on a Mac (server), iPhone (client), iPad (client) and is known for working on some Android devices (client).

License
-------
* The app includes:
  * Soundmanager2 which is under BSD license
  * Zepto.js: [http://zeptojs.com/license](http://zeptojs.com/license)
  * jQuery: [http://jquery.org/license](http://jquery.org/license)
  * animate.css: [http://daneden.me/animate/](http://daneden.me/animate/)
  * Montserrat font: [http://www.google.com/webfonts/specimen/Montserrat](http://www.google.com/webfonts/specimen/Montserrat)

This app is under the BSD license:

    Copyright (c) 2012, Maurice Svay
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.