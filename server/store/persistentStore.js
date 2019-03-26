const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();

let db;

const OPERATOR_TABLE = 'operators';

const ID_FIELD = 'id TEXT';
const NAME_FIELD = 'name TEXT';
const DISPLAY_NAME_FIELD = 'displayName TEXT';
const VERSION_FIELD = 'version TEXT';
const VERSION_COMPARE_FIELD = 'versionForCompare TEXT';
const REPLACES_FIELD = 'replaces TEXT';
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
const KEYWORDS_FIELD = 'keywords BLOB';
const CUSTOM_RESOURCE_DEFINITIONS_FIELD = 'customResourceDefinitions BLOB';
const PACKAGE_NAME_FIELD = 'packageName TEXT';
const GLOBAL_OPERATOR_FIELD = 'globalOperator INTEGER';

const PACKAGES_TABLE = 'packages';
const CHANNELS_FIELD = 'channels BLOB';
const DEFAULT_CHANNEL_FIELD = 'defaultChannel';
const DEFAULT_OPERATOR_ID_FIELD = 'defaultOperatorId';

const operatorFields = [
  'id',
  'name',
  'displayName',
  'version',
  'versionForCompare',
  'replaces',
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
  'keywords',
  'customResourceDefinitions',
  'packageName',
  'globalOperator'
];

const operatorFieldsList = operatorFields.join(', ');
const operatorFieldsRefs = _.map(operatorFields, () => '?').join(', ');

const packageFields = ['name', 'channels', 'defaultChannel', 'defaultOperatorId'];

const packageFieldsList = packageFields.join(', ');
const packageFieldsRefs = _.map(packageFields, () => '?').join(', ');

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
        ${REPLACES_FIELD},
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
        ${KEYWORDS_FIELD},
        ${CUSTOM_RESOURCE_DEFINITIONS_FIELD},
        ${PACKAGE_NAME_FIELD},
        ${GLOBAL_OPERATOR_FIELD}
      )`,
      err2 => {
        if (err2) {
          callback(err2);
        }
        db.run(
          `CREATE TABLE ${PACKAGES_TABLE} (
            ${NAME_FIELD},
            ${CHANNELS_FIELD},
            ${DEFAULT_CHANNEL_FIELD},
            ${DEFAULT_OPERATOR_ID_FIELD}
          )`,
          callback
        );
      }
    );
  });
};

exports.close = () => {
  db.close();
};

const normalizeOperatorRow = row => {
  row.links = JSON.parse(row.links);
  row.maintainers = JSON.parse(row.maintainers);
  row.customResourceDefinitions = JSON.parse(row.customResourceDefinitions);
  row.categories = JSON.parse(row.categories);
  row.keywords = JSON.parse(row.keywords);
  row.createdAt = JSON.parse(row.createdAt);
  row.globalOperator = JSON.parse(row.globalOperator);
  return row;
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
    callback(normalizeOperatorRow(rows[0]));
  });
};

exports.getOperators = callback => {
  db.all(`SELECT * FROM ${OPERATOR_TABLE}`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }
    const operators = _.map(rows, row => normalizeOperatorRow(row));
    callback(operators);
  });
};

exports.clearOperators = callback => {
  db.run(`DELETE FROM ${OPERATOR_TABLE}`, callback);
};

exports.setOperators = (operators, callback) => {
  const sql = `INSERT OR IGNORE INTO ${OPERATOR_TABLE} (${operatorFieldsList}) VALUES (${operatorFieldsRefs})`;

  exports.clearOperators(clearErr => {
    if (clearErr) {
      console.error(clearErr.message);
    }
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      operators.forEach(operator => {
        db.run(sql, [
          operator.id,
          operator.name,
          operator.displayName,
          operator.version,
          operator.versionForCompare,
          operator.replaces,
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
          JSON.stringify(operator.keywords),
          JSON.stringify(operator.customResourceDefinitions),
          operator.packageName,
          JSON.stringify(operator.globalOperator)
        ]);
      });
      db.run('END', callback);
    });
  });
};

const normalizePackageRow = row => {
  row.channels = JSON.parse(row.channels);
  return row;
};

exports.getPackage = (packageName, callback) => {
  db.all(`SELECT * FROM ${PACKAGES_TABLE} where name = '${packageName}'`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }

    if (!_.size(rows)) {
      callback(null, `package ${packageName} is not found.`);
      return;
    }
    const operatorPackage = normalizePackageRow(rows[0]);

    callback(operatorPackage);
  });
};

exports.getPackages = callback => {
  db.all(`SELECT * FROM ${PACKAGES_TABLE}`, (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(null, err.message);
      return;
    }

    const operatorPackages = _.map(rows, row => normalizePackageRow(row));

    callback(operatorPackages);
  });
};

exports.clearPackages = callback => {
  db.run(`DELETE FROM ${PACKAGES_TABLE}`, callback);
};

exports.setPackages = (packages, callback) => {
  const sql = `INSERT OR IGNORE INTO ${PACKAGES_TABLE} (${packageFieldsList}) VALUES (${packageFieldsRefs})`;

  exports.clearPackages(() =>
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      packages.forEach(operatorPackage => {
        db.run(sql, [
          operatorPackage.name,
          JSON.stringify(operatorPackage.channels),
          operatorPackage.defaultChannel,
          operatorPackage.defaultOperatorId
        ]);
      });
      db.run('END', callback);
    })
  );
};
