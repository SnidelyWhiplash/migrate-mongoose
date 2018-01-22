'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

require('colors');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MigrationModel = void 0;

_bluebird2.default.config({
  warnings: false
});

var es6Template = '\n/**\n * Make any changes you need to make to the database here\n */\nexport async function up () {\n  // Write migration here\n}\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexport async function down () {\n  // Write migration here\n}\n';

var es5Template = '\'use strict\';\n\n/**\n * Make any changes you need to make to the database here\n */\nexports.up = function up (done) {\n  done();\n};\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexports.down = function down(done) {\n  done();\n};\n';

var Migrator = function () {
  function Migrator(_ref) {
    var templatePath = _ref.templatePath,
        _ref$migrationsPath = _ref.migrationsPath,
        migrationsPath = _ref$migrationsPath === undefined ? './migrations' : _ref$migrationsPath,
        dbConnectionUri = _ref.dbConnectionUri,
        _ref$es6Templates = _ref.es6Templates,
        es6Templates = _ref$es6Templates === undefined ? false : _ref$es6Templates,
        _ref$collectionName = _ref.collectionName,
        collectionName = _ref$collectionName === undefined ? 'migrations' : _ref$collectionName,
        _ref$autosync = _ref.autosync,
        autosync = _ref$autosync === undefined ? false : _ref$autosync,
        _ref$cli = _ref.cli,
        cli = _ref$cli === undefined ? false : _ref$cli,
        connection = _ref.connection;
    (0, _classCallCheck3.default)(this, Migrator);

    var defaultTemplate = es6Templates ? es6Template : es5Template;
    this.template = templatePath ? _fs2.default.readFileSync(templatePath, 'utf-8') : defaultTemplate;
    this.migrationPath = _path2.default.resolve(migrationsPath);
    this.connection = connection || _mongoose2.default.createConnection(dbConnectionUri);
    this.es6 = es6Templates;
    this.collection = collectionName;
    this.autosync = autosync;
    this.cli = cli;
    MigrationModel = (0, _db2.default)(collectionName, this.connection);
  }

  (0, _createClass3.default)(Migrator, [{
    key: 'log',
    value: function log(logString) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force || this.cli) {
        console.log(logString);
      }
    }

    /**
     * Use your own Mongoose connection object (so you can use this('modelname')
     * @param {mongoose.connection} connection - Mongoose connection
     */

  }, {
    key: 'setMongooseConnection',
    value: function setMongooseConnection(connection) {
      MigrationModel = (0, _db2.default)(this.collection, connection);
    }

    /**
     * Close the underlying connection to mongo
     * @returns {Promise} A promise that resolves when connection is closed
     */

  }, {
    key: 'close',
    value: function close() {
      return this.connection ? this.connection.close() : _bluebird2.default.resolve();
    }

    /**
     * Create a new migration
     * @param {string} migrationName
     * @returns {Promise<Object>} A promise of the Migration created
     */

  }, {
    key: 'create',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(migrationName) {
        var existingMigration, now, newMigrationFile, migrationCreated;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return MigrationModel.findOne({ name: migrationName });

              case 3:
                existingMigration = _context.sent;

                if (!existingMigration) {
                  _context.next = 6;
                  break;
                }

                throw new Error(('There is already a migration with name \'' + migrationName + '\' in the database').red);

              case 6:
                _context.next = 8;
                return this.sync();

              case 8:
                now = Date.now();
                newMigrationFile = now + '-' + migrationName + '.js';

                _mkdirp2.default.sync(this.migrationPath);
                _fs2.default.writeFileSync(_path2.default.join(this.migrationPath, newMigrationFile), this.template);
                // create instance in db
                _context.next = 14;
                return this.connection;

              case 14:
                _context.next = 16;
                return MigrationModel.create({
                  name: migrationName,
                  createdAt: now
                });

              case 16:
                migrationCreated = _context.sent;

                this.log('Created migration ' + migrationName + ' in ' + this.migrationPath + '.');
                return _context.abrupt('return', migrationCreated);

              case 21:
                _context.prev = 21;
                _context.t0 = _context['catch'](0);

                this.log(_context.t0.stack);
                fileRequired(_context.t0);

              case 25:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 21]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Runs migrations up to or down to a given migration name
     *
     * @param migrationName
     * @param direction
     */

  }, {
    key: 'run',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _this = this;

        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'up';
        var migrationName = arguments[1];

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration;

        return _regenerator2.default.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.sync();

              case 2:
                if (!migrationName) {
                  _context3.next = 8;
                  break;
                }

                _context3.next = 5;
                return MigrationModel.findOne({ name: migrationName });

              case 5:
                _context3.t0 = _context3.sent;
                _context3.next = 11;
                break;

              case 8:
                _context3.next = 10;
                return MigrationModel.findOne().sort({ createdAt: -1 });

              case 10:
                _context3.t0 = _context3.sent;

              case 11:
                untilMigration = _context3.t0;

                if (untilMigration) {
                  _context3.next = 18;
                  break;
                }

                if (!migrationName) {
                  _context3.next = 17;
                  break;
                }

                throw new ReferenceError("Could not find that migration in the database");

              case 17:
                throw new Error("There are no pending migrations.");

              case 18:
                query = {
                  createdAt: { $lte: untilMigration.createdAt },
                  state: 'down'
                };


                if (direction == 'down') {
                  query = {
                    createdAt: { $gte: untilMigration.createdAt },
                    state: 'up'
                  };
                }

                sortDirection = direction == 'up' ? 1 : -1;
                _context3.next = 23;
                return MigrationModel.find(query).sort({ createdAt: sortDirection });

              case 23:
                migrationsToRun = _context3.sent;

                if (migrationsToRun.length) {
                  _context3.next = 31;
                  break;
                }

                if (!this.cli) {
                  _context3.next = 30;
                  break;
                }

                this.log('There are no migrations to run'.yellow);
                this.log('Current Migrations\' Statuses: ');
                _context3.next = 30;
                return this.list();

              case 30:
                throw new Error('There are no migrations to run');

              case 31:
                self = this;
                numMigrationsRan = 0;
                migrationsRan = [];
                _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(migration) {
                  var migrationFilePath, migrationFunctions;
                  return _regenerator2.default.wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);

                          if (_this.es6) {
                            require('babel-register')({
                              "presets": [require("babel-preset-env")],
                              "plugins": [require("babel-plugin-transform-runtime")]
                            });

                            require('babel-polyfill');
                          }

                          migrationFunctions = void 0;
                          _context2.prev = 3;

                          migrationFunctions = require(migrationFilePath);
                          _context2.next = 11;
                          break;

                        case 7:
                          _context2.prev = 7;
                          _context2.t0 = _context2['catch'](3);

                          _context2.t0.message = _context2.t0.message && /Unexpected token/.test(_context2.t0.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t0.message;
                          throw _context2.t0;

                        case 11:
                          if (migrationFunctions[direction]) {
                            _context2.next = 13;
                            break;
                          }

                          throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

                        case 13:
                          _context2.prev = 13;
                          _context2.next = 16;
                          return new _bluebird2.default(function (resolve, reject) {
                            var callPromise = migrationFunctions[direction].call(_this.connection.model.bind(_this.connection), function callback(err) {
                              if (err) return reject(err);
                              resolve();
                            });

                            if (callPromise && typeof callPromise.then === 'function') {
                              callPromise.then(resolve).catch(reject);
                            }
                          });

                        case 16:

                          _this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                          _context2.next = 19;
                          return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

                        case 19:
                          migrationsRan.push(migration.toJSON());
                          numMigrationsRan++;
                          _context2.next = 28;
                          break;

                        case 23:
                          _context2.prev = 23;
                          _context2.t1 = _context2['catch'](13);

                          _this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                          _this.log('Not continuing. Make sure your data is in consistent state'.red);
                          throw _context2.t1 instanceof Error ? _context2.t1 : new Error(_context2.t1);

                        case 28:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _loop, _this, [[3, 7], [13, 23]]);
                });
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 38;
                _iterator = (0, _getIterator3.default)(migrationsToRun);

              case 40:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context3.next = 46;
                  break;
                }

                migration = _step.value;
                return _context3.delegateYield(_loop(migration), 't1', 43);

              case 43:
                _iteratorNormalCompletion = true;
                _context3.next = 40;
                break;

              case 46:
                _context3.next = 52;
                break;

              case 48:
                _context3.prev = 48;
                _context3.t2 = _context3['catch'](38);
                _didIteratorError = true;
                _iteratorError = _context3.t2;

              case 52:
                _context3.prev = 52;
                _context3.prev = 53;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 55:
                _context3.prev = 55;

                if (!_didIteratorError) {
                  _context3.next = 58;
                  break;
                }

                throw _iteratorError;

              case 58:
                return _context3.finish(55);

              case 59:
                return _context3.finish(52);

              case 60:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context3.abrupt('return', migrationsRan);

              case 62:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee2, this, [[38, 48, 52, 60], [53,, 55, 59]]);
      }));

      function run() {
        return _ref3.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Looks at the file system migrations and imports any migrations that are
     * on the file system but missing in the database into the database
     *
     * This functionality is opposite of prune()
     */

  }, {
    key: 'sync',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var _this2 = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context5.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context5.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js$/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                filesNotInDb = _lodash2.default.filter(migrationsInFolder, { existsInDatabase: false }).map(function (f) {
                  return f.filename;
                });
                migrationsToImport = filesNotInDb;

                this.log('Synchronizing database with file system migrations...');

                if (!(!this.autosync && migrationsToImport.length)) {
                  _context5.next = 14;
                  break;
                }

                _context5.next = 12;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the migrations folder but not in the database. Select the ones you want to import into the database',
                    name: 'migrationsToImport',
                    choices: filesNotInDb
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 12:
                answers = _context5.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context5.abrupt('return', _bluebird2.default.map(migrationsToImport, function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(migrationToImport) {
                    var filePath, timestampSeparatorIndex, timestamp, migrationName, createdMigration;
                    return _regenerator2.default.wrap(function _callee3$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            filePath = _path2.default.join(_this2.migrationPath, migrationToImport), timestampSeparatorIndex = migrationToImport.indexOf('-'), timestamp = migrationToImport.slice(0, timestampSeparatorIndex), migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));


                            _this2.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                            _context4.next = 4;
                            return MigrationModel.create({
                              name: migrationName,
                              createdAt: timestamp
                            });

                          case 4:
                            createdMigration = _context4.sent;
                            return _context4.abrupt('return', createdMigration.toJSON());

                          case 6:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x4) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context5.t0;

              case 21:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee4, this, [[0, 17]]);
      }));

      function sync() {
        return _ref4.apply(this, arguments);
      }

      return sync;
    }()

    /**
     * Opposite of sync().
     * Removes files in migration directory which don't exist in database.
     */

  }, {
    key: 'prune',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, dbMigrationsNotOnFs, migrationsToDelete, answers, migrationsToDeleteDocs;
        return _regenerator2.default.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context6.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context6.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                dbMigrationsNotOnFs = _lodash2.default.filter(migrationsInDatabase, function (m) {
                  return !_lodash2.default.find(migrationsInFolder, { filename: m.filename });
                });
                migrationsToDelete = dbMigrationsNotOnFs.map(function (m) {
                  return m.name;
                });

                if (!(!this.autosync && !!migrationsToDelete.length)) {
                  _context6.next = 13;
                  break;
                }

                _context6.next = 11;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the database but not in the migrations folder. Select the ones you want to remove from the file system.',
                    name: 'migrationsToDelete',
                    choices: migrationsToDelete
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 11:
                answers = _context6.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context6.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context6.sent;

                if (!migrationsToDelete.length) {
                  _context6.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context6.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context6.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context6.prev = 23;
                _context6.t0 = _context6['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context6.t0;

              case 27:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee5, this, [[0, 23]]);
      }));

      function prune() {
        return _ref6.apply(this, arguments);
      }

      return prune;
    }()

    /**
     * Lists the current migrations and their statuses
     * @returns {Promise<Array<Object>>}
     * @example
     *   [
     *    { name: 'my-migration', filename: '149213223424_my-migration.js', state: 'up' },
     *    { name: 'add-cows', filename: '149213223453_add-cows.js', state: 'down' }
     *   ]
     */

  }, {
    key: 'list',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var _this3 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.sync();

              case 2:
                _context7.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context7.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context7.abrupt('return', migrations.map(function (m) {
                  _this3.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee6, this);
      }));

      function list() {
        return _ref7.apply(this, arguments);
      }

      return list;
    }()
  }]);
  return Migrator;
}();

exports.default = Migrator;


function fileRequired(error) {
  if (error && error.code == 'ENOENT') {
    throw new ReferenceError('Could not find any files at path \'' + error.path + '\'');
  }
}

module.exports = Migrator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJjb25maWciLCJ3YXJuaW5ncyIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImNvbm5lY3Rpb24iLCJkZWZhdWx0VGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlYWRGaWxlU3luYyIsIm1pZ3JhdGlvblBhdGgiLCJyZXNvbHZlIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsInJlcXVpcmUiLCJtaWdyYXRpb25GdW5jdGlvbnMiLCJtZXNzYWdlIiwidGVzdCIsInJlamVjdCIsImNhbGxQcm9taXNlIiwiY2FsbCIsIm1vZGVsIiwiYmluZCIsImNhbGxiYWNrIiwiZXJyIiwidGhlbiIsImNhdGNoIiwidG9VcHBlckNhc2UiLCJ3aGVyZSIsInVwZGF0ZSIsIiRzZXQiLCJwdXNoIiwidG9KU09OIiwiZ3JlZW4iLCJmaWxlc0luTWlncmF0aW9uRm9sZGVyIiwicmVhZGRpclN5bmMiLCJtaWdyYXRpb25zSW5EYXRhYmFzZSIsIm1pZ3JhdGlvbnNJbkZvbGRlciIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJzb21lIiwibSIsImZpbGVzTm90SW5EYiIsImYiLCJtaWdyYXRpb25zVG9JbXBvcnQiLCJwcm9tcHQiLCJ0eXBlIiwiY2hvaWNlcyIsImFuc3dlcnMiLCJtaWdyYXRpb25Ub0ltcG9ydCIsImZpbGVQYXRoIiwidGltZXN0YW1wU2VwYXJhdG9ySW5kZXgiLCJpbmRleE9mIiwidGltZXN0YW1wIiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsImNyZWF0ZWRNaWdyYXRpb24iLCJkYk1pZ3JhdGlvbnNOb3RPbkZzIiwibWlncmF0aW9uc1RvRGVsZXRlIiwiJGluIiwibGVhbiIsIm1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MiLCJjeWFuIiwicmVtb3ZlIiwibWlncmF0aW9ucyIsImVycm9yIiwiY29kZSIsInBhdGgiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUNBLElBQUlBLHVCQUFKOztBQUVBLG1CQUFRQyxNQUFSLENBQWU7QUFDYkMsWUFBVTtBQURHLENBQWY7O0FBSUEsSUFBTUMsOFNBQU47O0FBaUJBLElBQU1DLDBTQUFOOztJQW1CcUJDLFE7QUFDbkIsMEJBU0c7QUFBQSxRQVJEQyxZQVFDLFFBUkRBLFlBUUM7QUFBQSxtQ0FQREMsY0FPQztBQUFB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QixNQUE1QztrREFDakIrRCxXQUFXN0IsR0FBWCxDQUFlLFVBQUNNLENBQUQsRUFBTztBQUMzQix5QkFBS3ZFLEdBQUwsQ0FDRSxPQUFHdUUsRUFBRTlDLEtBQUYsSUFBVyxJQUFYLEdBQWtCLFNBQWxCLEdBQThCLFNBQWpDLEdBQTZDOEMsRUFBRTlDLEtBQUYsSUFBVyxJQUFYLEdBQWlCLE9BQWpCLEdBQTJCLEtBQXhFLFdBQ0k4QyxFQUFFakMsUUFETixDQURGO0FBSUEseUJBQU9pQyxFQUFFZCxNQUFGLEVBQVA7QUFDRCxpQkFOTSxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFqVFU3RSxROzs7QUE2VHJCLFNBQVNzQyxZQUFULENBQXNCNkUsS0FBdEIsRUFBNkI7QUFDM0IsTUFBSUEsU0FBU0EsTUFBTUMsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSTFFLGNBQUoseUNBQXdEeUUsTUFBTUUsSUFBOUQsUUFBTjtBQUNEO0FBQ0Y7O0FBR0RDLE9BQU9DLE9BQVAsR0FBaUJ2SCxRQUFqQiIsImZpbGUiOiJsaWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgJ2NvbG9ycyc7XG5pbXBvcnQgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBhc2sgZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQgTWlncmF0aW9uTW9kZWxGYWN0b3J5IGZyb20gJy4vZGInO1xubGV0IE1pZ3JhdGlvbk1vZGVsO1xuXG5Qcm9taXNlLmNvbmZpZyh7XG4gIHdhcm5pbmdzOiBmYWxzZVxufSk7XG5cbmNvbnN0IGVzNlRlbXBsYXRlID1cbmBcbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB5b3UgbmVlZCB0byBtYWtlIHRvIHRoZSBkYXRhYmFzZSBoZXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cCAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd24gKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuYDtcblxuY29uc3QgZXM1VGVtcGxhdGUgPVxuYCd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0cy51cCA9IGZ1bmN0aW9uIHVwIChkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0cy5kb3duID0gZnVuY3Rpb24gZG93bihkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5gO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZ3JhdG9yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHRlbXBsYXRlUGF0aCxcbiAgICBtaWdyYXRpb25zUGF0aCA9ICcuL21pZ3JhdGlvbnMnLFxuICAgIGRiQ29ubmVjdGlvblVyaSxcbiAgICBlczZUZW1wbGF0ZXMgPSBmYWxzZSxcbiAgICBjb2xsZWN0aW9uTmFtZSA9ICdtaWdyYXRpb25zJyxcbiAgICBhdXRvc3luYyA9IGZhbHNlLFxuICAgIGNsaSA9IGZhbHNlLFxuICAgIGNvbm5lY3Rpb25cbiAgfSkge1xuICAgIGNvbnN0IGRlZmF1bHRUZW1wbGF0ZSA9IGVzNlRlbXBsYXRlcyA/ICBlczZUZW1wbGF0ZSA6IGVzNVRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZVBhdGggPyBmcy5yZWFkRmlsZVN5bmModGVtcGxhdGVQYXRoLCAndXRmLTgnKSA6IGRlZmF1bHRUZW1wbGF0ZTtcbiAgICB0aGlzLm1pZ3JhdGlvblBhdGggPSBwYXRoLnJlc29sdmUobWlncmF0aW9uc1BhdGgpO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gfHwgbW9uZ29vc2UuY3JlYXRlQ29ubmVjdGlvbihkYkNvbm5lY3Rpb25VcmkpO1xuICAgIHRoaXMuZXM2ID0gZXM2VGVtcGxhdGVzO1xuICAgIHRoaXMuY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25OYW1lO1xuICAgIHRoaXMuYXV0b3N5bmMgPSBhdXRvc3luYztcbiAgICB0aGlzLmNsaSA9IGNsaTtcbiAgICBNaWdyYXRpb25Nb2RlbCA9IE1pZ3JhdGlvbk1vZGVsRmFjdG9yeShjb2xsZWN0aW9uTmFtZSwgdGhpcy5jb25uZWN0aW9uKTtcbiAgfVxuXG4gIGxvZyAobG9nU3RyaW5nLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKGZvcmNlIHx8IHRoaXMuY2xpKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2dTdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgeW91ciBvd24gTW9uZ29vc2UgY29ubmVjdGlvbiBvYmplY3QgKHNvIHlvdSBjYW4gdXNlIHRoaXMoJ21vZGVsbmFtZScpXG4gICAqIEBwYXJhbSB7bW9uZ29vc2UuY29ubmVjdGlvbn0gY29ubmVjdGlvbiAtIE1vbmdvb3NlIGNvbm5lY3Rpb25cbiAgICovXG4gIHNldE1vbmdvb3NlQ29ubmVjdGlvbiAoY29ubmVjdGlvbikge1xuICAgIE1pZ3JhdGlvbk1vZGVsID0gTWlncmF0aW9uTW9kZWxGYWN0b3J5KHRoaXMuY29sbGVjdGlvbiwgY29ubmVjdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgdW5kZXJseWluZyBjb25uZWN0aW9uIHRvIG1vbmdvXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uID8gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCkgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgbWlncmF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtaWdyYXRpb25OYW1lXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IEEgcHJvbWlzZSBvZiB0aGUgTWlncmF0aW9uIGNyZWF0ZWRcbiAgICovXG4gIGFzeW5jIGNyZWF0ZShtaWdyYXRpb25OYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTWlncmF0aW9uID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7IG5hbWU6IG1pZ3JhdGlvbk5hbWUgfSk7XG4gICAgICBpZiAoISFleGlzdGluZ01pZ3JhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIGFscmVhZHkgYSBtaWdyYXRpb24gd2l0aCBuYW1lICcke21pZ3JhdGlvbk5hbWV9JyBpbiB0aGUgZGF0YWJhc2VgLnJlZCk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgIGNvbnN0IG5ld01pZ3JhdGlvbkZpbGUgPSBgJHtub3d9LSR7bWlncmF0aW9uTmFtZX0uanNgO1xuICAgICAgbWtkaXJwLnN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHRoaXMubWlncmF0aW9uUGF0aCwgbmV3TWlncmF0aW9uRmlsZSksIHRoaXMudGVtcGxhdGUpO1xuICAgICAgLy8gY3JlYXRlIGluc3RhbmNlIGluIGRiXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICBjb25zdCBtaWdyYXRpb25DcmVhdGVkID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogbWlncmF0aW9uTmFtZSxcbiAgICAgICAgY3JlYXRlZEF0OiBub3dcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2coYENyZWF0ZWQgbWlncmF0aW9uICR7bWlncmF0aW9uTmFtZX0gaW4gJHt0aGlzLm1pZ3JhdGlvblBhdGh9LmApO1xuICAgICAgcmV0dXJuIG1pZ3JhdGlvbkNyZWF0ZWQ7XG4gICAgfSBjYXRjaChlcnJvcil7XG4gICAgICB0aGlzLmxvZyhlcnJvci5zdGFjayk7XG4gICAgICBmaWxlUmVxdWlyZWQoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIG1pZ3JhdGlvbnMgdXAgdG8gb3IgZG93biB0byBhIGdpdmVuIG1pZ3JhdGlvbiBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSBtaWdyYXRpb25OYW1lXG4gICAqIEBwYXJhbSBkaXJlY3Rpb25cbiAgICovXG4gIGFzeW5jIHJ1bihkaXJlY3Rpb24gPSAndXAnLCBtaWdyYXRpb25OYW1lKSB7XG4gICAgYXdhaXQgdGhpcy5zeW5jKCk7XG5cbiAgICBjb25zdCB1bnRpbE1pZ3JhdGlvbiA9IG1pZ3JhdGlvbk5hbWUgP1xuICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7bmFtZTogbWlncmF0aW9uTmFtZX0pIDpcbiAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoKS5zb3J0KHtjcmVhdGVkQXQ6IC0xfSk7XG5cbiAgICBpZiAoIXVudGlsTWlncmF0aW9uKSB7XG4gICAgICBpZiAobWlncmF0aW9uTmFtZSkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiQ291bGQgbm90IGZpbmQgdGhhdCBtaWdyYXRpb24gaW4gdGhlIGRhdGFiYXNlXCIpO1xuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBhcmUgbm8gcGVuZGluZyBtaWdyYXRpb25zLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgcXVlcnkgPSB7XG4gICAgICBjcmVhdGVkQXQ6IHskbHRlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXR9LFxuICAgICAgc3RhdGU6ICdkb3duJ1xuICAgIH07XG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICdkb3duJykge1xuICAgICAgcXVlcnkgPSB7XG4gICAgICAgIGNyZWF0ZWRBdDogeyRndGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdH0sXG4gICAgICAgIHN0YXRlOiAndXAnXG4gICAgICB9O1xuICAgIH1cblxuXG4gICAgY29uc3Qgc29ydERpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSAndXAnID8gMSA6IC0xO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQocXVlcnkpXG4gICAgICAuc29ydCh7Y3JlYXRlZEF0OiBzb3J0RGlyZWN0aW9ufSk7XG5cbiAgICBpZiAoIW1pZ3JhdGlvbnNUb1J1bi5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmNsaSkge1xuICAgICAgICB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJy55ZWxsb3cpO1xuICAgICAgICB0aGlzLmxvZyhgQ3VycmVudCBNaWdyYXRpb25zJyBTdGF0dXNlczogYCk7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdCgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nKTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IG51bU1pZ3JhdGlvbnNSYW4gPSAwO1xuICAgIGxldCBtaWdyYXRpb25zUmFuID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1pZ3JhdGlvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkZpbGVQYXRoID0gcGF0aC5qb2luKHNlbGYubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uLmZpbGVuYW1lKTtcbiAgICAgIGlmICh0aGlzLmVzNikge1xuICAgICAgICByZXF1aXJlKCdiYWJlbC1yZWdpc3RlcicpKHtcbiAgICAgICAgICBcInByZXNldHNcIjogW3JlcXVpcmUoXCJiYWJlbC1wcmVzZXQtZW52XCIpXSxcbiAgICAgICAgICBcInBsdWdpbnNcIjogW3JlcXVpcmUoXCJiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLXJ1bnRpbWVcIildXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXBvbHlmaWxsJyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBtaWdyYXRpb25GdW5jdGlvbnM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1pZ3JhdGlvbkZ1bmN0aW9ucyA9IHJlcXVpcmUobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGVyci5tZXNzYWdlID0gZXJyLm1lc3NhZ2UgJiYgL1VuZXhwZWN0ZWQgdG9rZW4vLnRlc3QoZXJyLm1lc3NhZ2UpID9cbiAgICAgICAgICAnVW5leHBlY3RlZCBUb2tlbiB3aGVuIHBhcnNpbmcgbWlncmF0aW9uLiBJZiB5b3UgYXJlIHVzaW5nIGFuIEVTNiBtaWdyYXRpb24gZmlsZSwgdXNlIG9wdGlvbiAtLWVzNicgOlxuICAgICAgICAgIGVyci5tZXNzYWdlO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIGlmICghbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIChgVGhlICR7ZGlyZWN0aW9ufSBleHBvcnQgaXMgbm90IGRlZmluZWQgaW4gJHttaWdyYXRpb24uZmlsZW5hbWV9LmAucmVkKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCBjYWxsUHJvbWlzZSA9ICBtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXS5jYWxsKFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKGNhbGxQcm9taXNlICYmIHR5cGVvZiBjYWxsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsUHJvbWlzZS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvZyhgJHtkaXJlY3Rpb24udG9VcHBlckNhc2UoKX06ICAgYFtkaXJlY3Rpb24gPT0gJ3VwJz8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttaWdyYXRpb24uZmlsZW5hbWV9IGApO1xuXG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLndoZXJlKHtuYW1lOiBtaWdyYXRpb24ubmFtZX0pLnVwZGF0ZSh7JHNldDoge3N0YXRlOiBkaXJlY3Rpb259fSk7XG4gICAgICAgIG1pZ3JhdGlvbnNSYW4ucHVzaChtaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgICBudW1NaWdyYXRpb25zUmFuKys7XG4gICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICB0aGlzLmxvZyhgRmFpbGVkIHRvIHJ1biBtaWdyYXRpb24gJHttaWdyYXRpb24ubmFtZX0gZHVlIHRvIGFuIGVycm9yLmAucmVkKTtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBjb250aW51aW5nLiBNYWtlIHN1cmUgeW91ciBkYXRhIGlzIGluIGNvbnNpc3RlbnQgc3RhdGVgLnJlZCk7XG4gICAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mKEVycm9yKSA/IGVyciA6IG5ldyBFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtaWdyYXRpb25zVG9SdW4ubGVuZ3RoID09IG51bU1pZ3JhdGlvbnNSYW4pIHRoaXMubG9nKCdBbGwgbWlncmF0aW9ucyBmaW5pc2hlZCBzdWNjZXNzZnVsbHkuJy5ncmVlbik7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnNSYW47XG4gIH1cblxuICAvKipcbiAgICogTG9va3MgYXQgdGhlIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMgYW5kIGltcG9ydHMgYW55IG1pZ3JhdGlvbnMgdGhhdCBhcmVcbiAgICogb24gdGhlIGZpbGUgc3lzdGVtIGJ1dCBtaXNzaW5nIGluIHRoZSBkYXRhYmFzZSBpbnRvIHRoZSBkYXRhYmFzZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgb3Bwb3NpdGUgb2YgcHJ1bmUoKVxuICAgKi9cbiAgYXN5bmMgc3luYygpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMkLy50ZXN0KGZpbGUpKVxuICAgICAgICAubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ3JlYXRlZEF0ID0gcGFyc2VJbnQoZmlsZW5hbWUuc3BsaXQoJy0nKVswXSk7XG4gICAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBtLmZpbGVuYW1lKTtcbiAgICAgICAgICByZXR1cm4ge2NyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsIGV4aXN0c0luRGF0YWJhc2V9O1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgZmlsZXNOb3RJbkRiID0gXy5maWx0ZXIobWlncmF0aW9uc0luRm9sZGVyLCB7ZXhpc3RzSW5EYXRhYmFzZTogZmFsc2V9KS5tYXAoZiA9PiBmLmZpbGVuYW1lKTtcbiAgICAgIGxldCBtaWdyYXRpb25zVG9JbXBvcnQgPSBmaWxlc05vdEluRGI7XG4gICAgICB0aGlzLmxvZygnU3luY2hyb25pemluZyBkYXRhYmFzZSB3aXRoIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMuLi4nKTtcbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiBtaWdyYXRpb25zVG9JbXBvcnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoe1xuICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGUgZm9sbG93aW5nIG1pZ3JhdGlvbnMgZXhpc3QgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIGJ1dCBub3QgaW4gdGhlIGRhdGFiYXNlLiBTZWxlY3QgdGhlIG9uZXMgeW91IHdhbnQgdG8gaW1wb3J0IGludG8gdGhlIGRhdGFiYXNlJyxcbiAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9JbXBvcnQnLFxuICAgICAgICAgICAgY2hvaWNlczogZmlsZXNOb3RJbkRiXG4gICAgICAgICAgfSwgKGFuc3dlcnMpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGFuc3dlcnMubWlncmF0aW9uc1RvSW1wb3J0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5tYXAobWlncmF0aW9uc1RvSW1wb3J0LCBhc3luYyAobWlncmF0aW9uVG9JbXBvcnQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBtaWdyYXRpb25Ub0ltcG9ydCksXG4gICAgICAgICAgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXggPSBtaWdyYXRpb25Ub0ltcG9ydC5pbmRleE9mKCctJyksXG4gICAgICAgICAgdGltZXN0YW1wID0gbWlncmF0aW9uVG9JbXBvcnQuc2xpY2UoMCwgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXgpLFxuICAgICAgICAgIG1pZ3JhdGlvbk5hbWUgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSh0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCArIDEsIG1pZ3JhdGlvblRvSW1wb3J0Lmxhc3RJbmRleE9mKCcuJykpO1xuXG4gICAgICAgIHRoaXMubG9nKGBBZGRpbmcgbWlncmF0aW9uICR7ZmlsZVBhdGh9IGludG8gZGF0YWJhc2UgZnJvbSBmaWxlIHN5c3RlbS4gU3RhdGUgaXMgYCArIGBET1dOYC5yZWQpO1xuICAgICAgICBjb25zdCBjcmVhdGVkTWlncmF0aW9uID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogdGltZXN0YW1wXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY3JlYXRlZE1pZ3JhdGlvbi50b0pTT04oKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHN5bmNocm9uaXNlIG1pZ3JhdGlvbnMgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIHVwIHRvIHRoZSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3Bwb3NpdGUgb2Ygc3luYygpLlxuICAgKiBSZW1vdmVzIGZpbGVzIGluIG1pZ3JhdGlvbiBkaXJlY3Rvcnkgd2hpY2ggZG9uJ3QgZXhpc3QgaW4gZGF0YWJhc2UuXG4gICAqL1xuICBhc3luYyBwcnVuZSgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMvLnRlc3QoZmlsZSkgKVxuICAgICAgICAubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlQ3JlYXRlZEF0ID0gcGFyc2VJbnQoZmlsZW5hbWUuc3BsaXQoJy0nKVswXSk7XG4gICAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBtLmZpbGVuYW1lKTtcbiAgICAgICAgICByZXR1cm4geyBjcmVhdGVkQXQ6IGZpbGVDcmVhdGVkQXQsIGZpbGVuYW1lLCAgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgZGJNaWdyYXRpb25zTm90T25GcyA9IF8uZmlsdGVyKG1pZ3JhdGlvbnNJbkRhdGFiYXNlLCBtID0+IHtcbiAgICAgICAgcmV0dXJuICFfLmZpbmQobWlncmF0aW9uc0luRm9sZGVyLCB7IGZpbGVuYW1lOiBtLmZpbGVuYW1lIH0pXG4gICAgICB9KTtcblxuXG4gICAgICBsZXQgbWlncmF0aW9uc1RvRGVsZXRlID0gZGJNaWdyYXRpb25zTm90T25Gcy5tYXAoIG0gPT4gbS5uYW1lICk7XG5cbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiAhIW1pZ3JhdGlvbnNUb0RlbGV0ZS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdCh7XG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgZGF0YWJhc2UgYnV0IG5vdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byByZW1vdmUgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uJyxcbiAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9EZWxldGUnLFxuICAgICAgICAgICAgY2hvaWNlczogbWlncmF0aW9uc1RvRGVsZXRlXG4gICAgICAgICAgfSwgKGFuc3dlcnMpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGFuc3dlcnMubWlncmF0aW9uc1RvRGVsZXRlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaWdyYXRpb25zVG9EZWxldGVEb2NzID0gYXdhaXQgTWlncmF0aW9uTW9kZWxcbiAgICAgICAgLmZpbmQoe1xuICAgICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgICB9KS5sZWFuKCk7XG5cbiAgICAgIGlmIChtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMubG9nKGBSZW1vdmluZyBtaWdyYXRpb24ocykgYCwgYCR7bWlncmF0aW9uc1RvRGVsZXRlLmpvaW4oJywgJyl9YC5jeWFuLCBgIGZyb20gZGF0YWJhc2VgKTtcbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwucmVtb3ZlKHtcbiAgICAgICAgICBuYW1lOiB7ICRpbjogbWlncmF0aW9uc1RvRGVsZXRlIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtaWdyYXRpb25zVG9EZWxldGVEb2NzO1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3QgcHJ1bmUgZXh0cmFuZW91cyBtaWdyYXRpb25zIGZyb20gZGF0YWJhc2UuYC5yZWQpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3RzIHRoZSBjdXJyZW50IG1pZ3JhdGlvbnMgYW5kIHRoZWlyIHN0YXR1c2VzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PE9iamVjdD4+fVxuICAgKiBAZXhhbXBsZVxuICAgKiAgIFtcbiAgICogICAgeyBuYW1lOiAnbXktbWlncmF0aW9uJywgZmlsZW5hbWU6ICcxNDkyMTMyMjM0MjRfbXktbWlncmF0aW9uLmpzJywgc3RhdGU6ICd1cCcgfSxcbiAgICogICAgeyBuYW1lOiAnYWRkLWNvd3MnLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQ1M19hZGQtY293cy5qcycsIHN0YXRlOiAnZG93bicgfVxuICAgKiAgIF1cbiAgICovXG4gIGFzeW5jIGxpc3QoKSB7XG4gICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgY29uc3QgbWlncmF0aW9ucyA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoKS5zb3J0KHsgY3JlYXRlZEF0OiAxIH0pO1xuICAgIGlmICghbWlncmF0aW9ucy5sZW5ndGgpIHRoaXMubG9nKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBsaXN0LicueWVsbG93KTtcbiAgICByZXR1cm4gbWlncmF0aW9ucy5tYXAoKG0pID0+IHtcbiAgICAgIHRoaXMubG9nKFxuICAgICAgICBgJHttLnN0YXRlID09ICd1cCcgPyAnVVA6ICBcXHQnIDogJ0RPV046XFx0J31gW20uc3RhdGUgPT0gJ3VwJz8gJ2dyZWVuJyA6ICdyZWQnXSArXG4gICAgICAgIGAgJHttLmZpbGVuYW1lfWBcbiAgICAgICk7XG4gICAgICByZXR1cm4gbS50b0pTT04oKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gZmlsZVJlcXVpcmVkKGVycm9yKSB7XG4gIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09ICdFTk9FTlQnKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBDb3VsZCBub3QgZmluZCBhbnkgZmlsZXMgYXQgcGF0aCAnJHtlcnJvci5wYXRofSdgKTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWlncmF0b3I7XG5cbiJdfQ==