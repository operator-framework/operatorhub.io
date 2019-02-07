const persistentStore = require('../store/persistentStore');

const fetchOperator = (serverRequest, serverResponse) => {
  persistentStore.getOperator(serverRequest.query.name, operators => {
    serverResponse.send({ operators });
  });
};

const fetchOperators = (serverRequest, serverResponse) => {
  persistentStore.getOperators(operators => {
    serverResponse.send({ operators });
  });
};


const operatorsService = {
  fetchOperators,
  fetchOperator
};
module.exports = operatorsService;
