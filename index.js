'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noop = function noop() {};

var StatementBindings = function () {
  function StatementBindings(stmt, TaskImpl) {
    _classCallCheck(this, StatementBindings);

    this._stmt = stmt;
    this.TaskImpl = TaskImpl;
  }

  _createClass(StatementBindings, [{
    key: "run",
    value: function run(sql) {
      var _this = this;

      var self = this;
      return this.TaskImpl(function (rej, res) {
        _this._stmt.run(sql, function (err) {
          return err ? rej(err) : res(self);
        });
      });
    }
  }, {
    key: "finalize",
    value: function finalize() {
      var _this2 = this;

      return this.TaskImpl(function (rej, res) {
        _this2._stmt.finalize(function (err) {
          return err ? rej(err) : res();
        });
      });
    }
  }]);

  return StatementBindings;
}();

var DatabaseBindings = function () {
  function DatabaseBindings(db, TaskImpl) {
    _classCallCheck(this, DatabaseBindings);

    this.TaskImpl = TaskImpl;
    this._db = db;
  }

  _createClass(DatabaseBindings, [{
    key: "wrapStmt",
    value: function wrapStmt(stmt) {
      return new StatementBindings(stmt, this.TaskImpl);
    }

    // https://github.com/mapbox/node-sqlite3/wiki/API#databaseclosecallback

  }, {
    key: "close",
    value: function close() {
      var _this3 = this;

      return this.TaskImpl(function (rej, res) {
        _this3._db.close(function (err) {
          return err ? rej(err) : res();
        });
      });
    }
  }, {
    key: "all",
    value: function all(sql, params) {
      var _this4 = this;

      return this.TaskImpl(function (rej, res) {
        _this4._db.all(sql, params, function (err, rows) {
          return err ? rej(err) : res(rows);
        });
      });
    }
  }, {
    key: "prepare",
    value: function prepare(sql, params) {
      var _this5 = this;

      var self = this;
      return this.TaskImpl(function (rej, res) {
        _this5._db.prepare(sql, params, function (err) {
          return err ? rej(err) : res(self.wrapStmt(this));
        });
      });
    }
  }, {
    key: "run",
    value: function run(sql) {
      var _this6 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      return this.TaskImpl(function (rej, res) {
        _this6._db.run(sql, params, function (err) {
          return err ? rej(err) : res(this);
        });
      });
    }
  }, {
    key: "get",
    value: function get(sql) {
      var _this7 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      return this.TaskImpl(function (rej, res) {
        _this7._db.get(sql, params, function (err, row) {
          return err ? rej(err) : res(row);
        });
      });
    }
  }, {
    key: "each",
    value: function each(sql, params) {
      var _this8 = this;

      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

      return this.TaskImpl(function (rej, res) {
        _this8._db.each(sql, params, callback, function (err, rows) {
          return err ? rej(err) : res(rows);
        });
      });
    }
  }, {
    key: "exec",
    value: function exec(sql) {
      var _this9 = this;

      return this.TaskImpl(function (rej, res) {
        _this9._db.exec(sql, function (err) {
          return err ? rej(err) : res();
        });
      });
    }
  }]);

  return DatabaseBindings;
}();

function createBindings(TaskImpl, db) {
  return new DatabaseBindings(db, TaskImpl);
}

module.exports = createBindings;
