const axios = require('axios');
const _ = require('lodash');
const jsBase64 = require('js-base64');
const yaml = require('js-yaml');

const { Base64 } = jsBase64;
const gitHubURL = 'https://api.github.com';
const operatorsRepoOwner = `operator-framework`;
const operatorsRepoProject = `community-operators`;
const operatorsRepo = `galletti94/community-operators-demo`; // `${operatorsRepoOwner}/${operatorsRepoProject}`;
const operatorsDirectory = `community-operators`;
const operatorFileQuery = `*.clusterserviceversion.yaml`;

const allOperatorsRequest = `${gitHubURL}/search/code?q=repo:${operatorsRepo}+path:${operatorsDirectory}+filename:${operatorFileQuery}`;
const operatorContentsURL = `${gitHubURL}/repos/${operatorsRepo}/contents`;

const getErrorResponse = error => ({
  err: true,
  message: error.response.data.message
});

const fetchOperator = (serverRequest, serverResponse) => {
  const operatorName = serverRequest.query.name;

  const request = `${gitHubURL}/search/code?q='displayName: ${operatorName}'+repo:${operatorsRepo}+filename:${operatorFileQuery}`;

  axios
    .get(request)
    .then(response => {
      const operatorFiles = response.data.items;
      const operatorRequests = [];

      _.forEach(operatorFiles, operatorFile => {
        operatorRequests.push(axios.get(`${operatorContentsURL}/${operatorFile.path}`));
      });

      return axios
        .all(operatorRequests)
        .then(({ ...allResults }) => {
          serverResponse.send(allResults);
        })
        .catch(error => {
          console.dir(error);
          serverResponse.send(error);
        });
    })
    .catch(error => {
      console.dir(error);
      serverResponse.send(error);
    });
};

const fetchOperators = (serverRequest, serverResponse) => {
  console.log('fetch operators');
  axios
    .get(allOperatorsRequest)
    .then(response => {
      const operatorFiles = response.data.items;
      const operatorRequests = [];

      _.forEach(operatorFiles, operatorFile => {
        console.log(`Requesting ${operatorFile.path}`);
        operatorRequests.push(axios.get(`${operatorContentsURL}/${operatorFile.path}`));
      });

      return axios
        .all(operatorRequests)
        .then(({ ...allResults }) => {
          const operators = [];
          _.forEach(allResults, operatorResult => {
            try {
              const operator = yaml.safeLoad(Base64.decode(operatorResult.data.content));
              operators.push(operator);
            } catch (e) {
              console.log(`Error Parsing ${_.get(operatorResult, 'data.name', 'Unknown Operator')}`);
              console.dir(e);
            }
          });
          serverResponse.send({ operators });
        })
        .catch(error => {
          console.dir(error.response.data);
          serverResponse.status(error.response.status).send(error.response.data);
        });
    })
    .catch(error => {
      console.dir(error);
      serverResponse.status(error.response.status).send(error.response.data);
    });
};

const operatorsService = {
  fetchOperators,
  fetchOperator
};
module.exports = operatorsService;
