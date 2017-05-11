const sqlite3 = require('sqlite3').verbose()
const sqliteDB = new sqlite3.Database(':memory:')
const taskqlite = require('../src/index.js')
const Taskorama = require('taskorama').default
const Fluture = require('fluture')

let Task = Fluture

// range :: Int -> Int -> Array Int
const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (v, k) => start + k)

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
      return
    })
  )
  .chain(_ => database.all('SELECT rowid AS id, info FROM lorem'))
  .map(rows => console.log(rows))
  .chain(_ => database.close())
  .fork(
    err => console.log('error ->', err),
    res => console.log('done! ->', res)
  )
