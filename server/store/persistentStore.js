const sqlite3 = require('sqlite3').verbose();

let db;

const OPERATOR_TABLE = 'operators';
const NAME_FIELD = 'name TEXT';
const VERSION_FIELD = 'version TEXT';
const VERSION_COMPARE_FIELD = 'versionForCompare TEXT';
const PROVIDER_FIELD = 'provider TEXT';
const DESCRIPTION_FIELD = 'description TEXT';
const LONG_DESCRIPTION_FIELD = 'longDescription TEXT';
const IMG_FIELD = 'imgUrl TEXT';
const MATURITY_FIELD = 'maturity BLOB';
const LINKS_FIELD = 'links BLOB';
const MAINTAINERS_FIELD = 'maintainers BLOB';
const CREATED_FIELD = 'createdAt BLOB';
const CONTAINER_IMAGE_FIELD = 'containerImage TEXT';

exports.initialize = callback => {
  db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE, err => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    console.log('Connected to the in-memory SQlite database.');
    db.run(
      `CREATE TABLE ${OPERATOR_TABLE} (
        ${NAME_FIELD},
        ${VERSION_FIELD},
        ${VERSION_COMPARE_FIELD},
        ${PROVIDER_FIELD},
        ${DESCRIPTION_FIELD},
        ${LONG_DESCRIPTION_FIELD},
        ${IMG_FIELD},
        ${MATURITY_FIELD},
        ${LINKS_FIELD},
        ${MAINTAINERS_FIELD},
        ${CREATED_FIELD},
        ${CONTAINER_IMAGE_FIELD}
      )`,
      callback
    );
  });
};

exports.close = () => {
  db.close();
};

exports.getOperator = (operatorName, callback) => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE} where name = '${operatorName}'`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    callback(rows);
  });
};

exports.getOperators = callback => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE}`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    callback(rows);
  });
};

exports.clearOperators = callback => {
  db.run(`DELETE FROM ${OPERATOR_TABLE}`, callback);
};

exports.setOperators = (operators, callback) => {
  const sql = `INSERT OR IGNORE INTO ${OPERATOR_TABLE}
    (name, version, versionForCompare, provider, description, longDescription, imgUrl, maturity, links, maintainers, createdAt, containerImage)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  exports.clearOperators(() =>
    db.serialize(
      () => {
        db.run('BEGIN TRANSACTION');
        operators.forEach(operator => {
          db.run(sql, [
            operator.name,
            operator.version,
            operator.versionForCompare,
            operator.provider,
            operator.description,
            operator.longDescription,
            operator.imgUrl,
            operator.maturity || null,
            operator.links || null,
            operator.maintainers || null,
            operator.createdAt || null,
            operator.containerImage
          ]);
        });
        db.run('END', callback);
      },
      err => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`Rows inserted`);
        }
        callback(err);
      }
    )
  );
};
