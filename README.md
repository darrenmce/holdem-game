holdem-game
===========

A small node [express](http://expressjs.com)/[redis](http://redis.io) game utilizing [poker-sim](http://github.com/darrenmce/poker-sim) and playingCards.js to play texas holdem


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

if this is not working, try cloning the repo directly into the node_modules folder before running npm install with:

```
git clone https://github.com/darrenmce/poker-evaluator.git
```

**OPTIONAL DB** - In a seperate window, run a redis server 2.6+ (not sure if this version is entirely necessary, but if it doesn't work try updating)
```
redis-server
```

Run the game. Use the **--nodb** flag if not running the redis server and Use **-l** flag for verbose logging (express.logger).
```
node game [--nodb] [-l]
```

Then open a browser to [http://localhost:3000](http://localhost:3000)
