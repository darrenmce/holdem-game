holdem-game
===========

A small node [express](http://expressjs.com)/[redis](http://redis.io) game utilizing poker-sim and playingCards.js to play texas holdem


Usage
----------

install [bower](http://bower.io) components
```
bower install
```

npm install make take a while, poker-sim uses poker-evaluator which uses a 130meg data file
```
npm install
```

**OPTIONAL DB** - In a seperate window, run a redis server 2.6+ (not sure if this version is entirely necessary, but if it doesn't work try updating)
```
redis-server
```

Run the game. Use the **--nodb**_ flag if not running the redis server and Use **-l** flag for verbose logging (express.logger).
```
node game [--nodb] [-l]
```

Then open a browser to [http://localhost:3000](http://localhost:3000)
