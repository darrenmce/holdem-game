holdem-game
===========

A small express/redis/jquery game utilizing poker-sim and playingCards.js to play texas holdem

Usage
----------

npm install make take a while, poker-sim uses poker-evaluator which uses a 130meg data file
```
npm install
```

In a seperate window, run a redis server 2.6+ (not sure if this version is entirely necessary, but if it doesn't work try updating)
```
redis-server
```

Run the game
```
node game
```

Then open a browser to http://localhost:3000
