const noop = () => {}

class StatementBindings {
  constructor(stmt, TaskImpl) {
    this._stmt = stmt
    this.TaskImpl = TaskImpl
  }

  run(sql) {
    var self = this
    return this.TaskImpl((res, rej) => {
      this._stmt.run(sql, function(err) {
        return err ? rej(err) : res(self)
      })
    })
  }

  finalize() {
    return this.TaskImpl((res, rej) => {
      this._stmt.finalize(err => (err ? rej(err) : res()))
    })
  }
}

class DatabaseBindings {
  constructor(db, TaskImpl) {
    this.TaskImpl = TaskImpl
    this._db = db
  }

  wrapStmt(stmt) {
    return new StatementBindings(stmt, this.TaskImpl)
  }

  // https://github.com/mapbox/node-sqlite3/wiki/API#databaseclosecallback
  close() {
    return this.TaskImpl((res, rej) => {
      this._db.close(err => (err ? rej(err) : res()))
    })
  }

  all(sql, params) {
    return this.TaskImpl((res, rej) => {
      this._db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
    })
  }

  prepare(sql, params) {
    var self = this
    return this.TaskImpl((res, rej) => {
      this._db.prepare(sql, params, function(err) {
        return err ? rej(err) : res(self.wrapStmt(this))
      })
    })
  }

  run(sql, params = []) {
    return this.TaskImpl((res, rej) => {
      this._db.run(sql, params, function(err) {
        return err ? rej(err) : res(this)
      })
    })
  }

  get(sql, params = []) {
    return this.TaskImpl((res, rej) => {
      this._db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
    })
  }

  each(sql, params, callback = noop) {
    return this.TaskImpl((res, rej) => {
      this._db.each(
        sql,
        params,
        callback,
        (err, rows) => (err ? rej(err) : res(rows))
      )
    })
  }

  exec(sql) {
    return this.TaskImpl((res, rej) => {
      this._db.exec(sql, err => (err ? rej(err) : res()))
    })
  }
}

export function createBindings(TaskImpl, db) {
  return new DatabaseBindings(db, TaskImpl)
}

module.exports = createBindings
