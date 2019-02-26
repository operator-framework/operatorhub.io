const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();

let db;

const OPERATOR_TABLE = 'operators';

const ID_FIELD = 'id TEXT';
const NAME_FIELD = 'name TEXT';
const DISPLAY_NAME_FIELD = 'displayName TEXT';
const VERSION_FIELD = 'version TEXT';
const VERSION_COMPARE_FIELD = 'versionForCompare TEXT';
const PROVIDER_FIELD = 'provider TEXT';
const DESCRIPTION_FIELD = 'description TEXT';
const LONG_DESCRIPTION_FIELD = 'longDescription TEXT';
const IMG_FIELD = 'imgUrl TEXT';
const CAPABILITY_LEVEL_FIELD = 'capabilityLevel BLOB';
const LINKS_FIELD = 'links BLOB';
const REPOSITORY_FIELD = 'repository TEXT';
const MAINTAINERS_FIELD = 'maintainers BLOB';
const CREATED_FIELD = 'createdAt BLOB';
const CONTAINER_IMAGE_FIELD = 'containerImage TEXT';
const CATEGORIES_FIELD = 'categories BLOB';
const CUSTOM_RESOURCE_DEFINITIONS_FIELD = 'customResourceDefinitions BLOB';
const PACKAGE_NAME_FIELD = 'packageName TEXT';
const CHANNELS_FIELD = 'channels BLOB';

const operatorFields = [
  'id',
  'name',
  'displayName',
  'version',
  'versionForCompare',
  'provider',
  'description',
  'longDescription',
  'imgUrl',
  'capabilityLevel',
  'links',
  'repository',
  'maintainers',
  'createdAt',
  'containerImage',
  'categories',
  'customResourceDefinitions',
  'packageName',
  'channels'
];

const operatorFieldsList = operatorFields.join(', ');
const operatorFieldsRefs = _.map(operatorFields, () => '?').join(', ');

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
        ${ID_FIELD},
        ${NAME_FIELD},
        ${DISPLAY_NAME_FIELD},
        ${VERSION_FIELD},
        ${VERSION_COMPARE_FIELD},
        ${PROVIDER_FIELD},
        ${DESCRIPTION_FIELD},
        ${LONG_DESCRIPTION_FIELD},
        ${IMG_FIELD},
        ${CAPABILITY_LEVEL_FIELD},
        ${LINKS_FIELD},
        ${REPOSITORY_FIELD},
        ${MAINTAINERS_FIELD},
        ${CREATED_FIELD},
        ${CONTAINER_IMAGE_FIELD},
        ${CATEGORIES_FIELD},
        ${CUSTOM_RESOURCE_DEFINITIONS_FIELD},
        ${PACKAGE_NAME_FIELD},
        ${CHANNELS_FIELD}
      )`,
      callback
    );
  });
};

exports.close = () => {
  db.close();
};

const normalizeRow = row => {
  row.links = JSON.parse(row.links);
  row.maintainers = JSON.parse(row.maintainers);
  row.customResourceDefinitions = JSON.parse(row.customResourceDefinitions);
  row.categories = JSON.parse(row.categories);
  row.createdAt = JSON.parse(row.createdAt);
  row.channels = JSON.parse(row.channels);
  return row;
};

exports.getVersionedOperator = (operatorName, callback) => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE} where name = '${operatorName}'`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }

    if (!_.size(rows)) {
      callback(null, `operator ${operatorName} is not found.`);
      return;
    }
    callback(normalizeRow(rows[0]));
  });
};

exports.getOperator = (operatorName, callback) => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE} where name = '${operatorName}'`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }

    if (!_.size(rows)) {
      callback(null, `operator ${operatorName} is not found.`);
      return;
    }

    db.all(`SELECT * FROM ${OPERATOR_TABLE} where id = '${rows[0].id}'`, (err2, allRows) => {
      if (err) {
        console.error(err.message);
        callback(null, err.message);
        return;
      }
      const operators = _.map(allRows, row => normalizeRow(row));
      callback(operators);
    });
  });
};

exports.getOperators = callback => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE}`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }
    const operators = _.map(rows, row => normalizeRow(row));
    callback(operators);
  });
};

exports.clearOperators = callback => {
  db.run(`DELETE FROM ${OPERATOR_TABLE}`, callback);
};

exports.setOperators = (operators, callback) => {
  const sql = `INSERT OR IGNORE INTO ${OPERATOR_TABLE} (${operatorFieldsList}) VALUES (${operatorFieldsRefs})`;

  exports.clearOperators(() =>
    db.serialize(
      () => {
        db.run('BEGIN TRANSACTION');
        operators.forEach(operator => {
          db.run(sql, [
            operator.id,
            operator.name,
            operator.displayName,
            operator.version,
            operator.versionForCompare,
            operator.provider,
            operator.description,
            operator.longDescription,
            operator.imgUrl,
            operator.capabilityLevel || null,
            JSON.stringify(operator.links),
            operator.repository,
            JSON.stringify(operator.maintainers),
            JSON.stringify(operator.createdAt),
            operator.containerImage,
            JSON.stringify(operator.categories),
            JSON.stringify(operator.customResourceDefinitions),
            operator.packageName,
            JSON.stringify(operator.channels)
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
