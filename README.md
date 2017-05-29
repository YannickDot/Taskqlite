# Taskqlite

Taskqlite is a wrapper for [node-sqlite3](https://github.com/mapbox/node-sqlite3) exposing a monadic interface. 🎁


## Install

Install taskqlite and sqlite
```
yarn add taskqlite sqlite3
```
And install a task data type like [Taskorama](https://github.com/YannickDot/Taskorama) or [Fluture](https://github.com/fluture-js/Fluture)

```
yarn add taskorama
```

## Demo 
```js

const sqlite3 = require('sqlite3').verbose()
const sqliteDB = new sqlite3.Database(':memory:')
const taskqlite = require('taskqlite')

const Taskorama = require('taskorama').default
const Fluture = require('fluture')

const Task = Taskorama // or const Task = Fluture :)

const database = taskqlite(Task, sqliteDB)


Task.of(`Let's use Tasks with sqlite`)
  .chain(_ => database.run('CREATE TABLE lorem (info TEXT)'))
  .chain(_ => database.prepare('INSERT INTO lorem VALUES (?)'))
  .chain(stmt =>
    Task.do(function*() {
      for (num of [1, 2, 3, 4, 5]) {
        yield stmt.run('Ipsum ' + num)
      }
      yield stmt.finalize()
    })
  )
  .chain(_ => database.all('SELECT rowid AS id, info FROM lorem'))
  .fork(
    err => console.log('error ->', err),
    res => console.log('done! ->', res)
  )
``` 

Logs : 

```js
/* 
done! -> [ { id: 1, info: 'Ipsum 1' },
  { id: 2, info: 'Ipsum 2' },
  { id: 3, info: 'Ipsum 3' },
  { id: 4, info: 'Ipsum 4' },
  { id: 5, info: 'Ipsum 5' } ]  
 */
``` 



