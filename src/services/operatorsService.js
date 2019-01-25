import axios from 'axios';
import * as _ from 'lodash-es';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';
import { normalizeOperators } from '../utils/operatorUtils';

const gitHubURL = 'https://api.github.com';
const operatorsRepo = `operator-framework/community-operators`;
const operatorFileQuery = `*.clusterserviceversion.yaml`;

const allOperatorsRequest = `${gitHubURL}/search/code?q=repo:${operatorsRepo}+filename:${operatorFileQuery}`;
const operatorContentsURL = `${gitHubURL}/repos/${operatorsRepo}/contents`;

// Refresh data after 20 minutes
const REFRESH_DATA_THRESHOLD = 20 * 60 * 1000;

let lastUpdateTime = 0;
let latestOperators = [];

const parseContentsResults = results => {
  const operators = [];
  _.forEach(results, operatorResult => {
    try {
      const operator = yaml.safeLoad(Base64.decode(operatorResult.data.content));
      operators.push(operator);
    } catch (e) {
      console.log(`Error Parsing ${_.get(operatorResult, 'data.name', 'Unknown Operator')}`);
      console.dir(e);
    }
  });
  return normalizeOperators(operators);
};

const fetchOperator = (operatorName, dispatch) => {
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
          const operators = parseContentsResults(allResults);
          const operator = _.find(operators, { name: operatorName });
          if (operator) {
            dispatch({
              type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
              payload: operator
            });
            return;
          }
          dispatch({
            type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
            payload: { message: `Unable to find operator details for ${operatorName}` }
          });
        })
        .catch(error => {
          dispatch({
            type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
            error
          });
        });
    })
    .catch(error => {
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error
      });
    });
};

const fetchOperators = operatorName => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  const currentTime = new Date().getTime();

  if (currentTime - lastUpdateTime < REFRESH_DATA_THRESHOLD) {
    if (operatorName) {
      const operator = _.find(latestOperators, { name: operatorName });
      if (operator) {
        dispatch({
          type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
          payload: operator
        });
        return;
      }

      fetchOperator(operatorName);
      return;
    }

    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
      payload: latestOperators
    });
    return;
  }

  axios
    .get(allOperatorsRequest)
    .then(response => {
      const operatorFiles = response.data.items;
      const operatorRequests = [];

      _.forEach(operatorFiles, operatorFile => {
        operatorRequests.push(axios.get(`${operatorContentsURL}/${operatorFile.path}`));
      });

      return axios
        .all(operatorRequests)
        .then(({ ...allResults }) => {
          latestOperators = parseContentsResults(allResults);
          lastUpdateTime = new Date().getTime();

          dispatch({
            type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
            payload: latestOperators
          });

          if (operatorName) {
            const operator = _.find(latestOperators, { name: operatorName });
            if (operator) {
              dispatch({
                type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
                payload: operator
              });
              return;
            }

            fetchOperator(operatorName);
          }
        })
        .catch(error => {
          dispatch({
            type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
            error
          });
        });
    })
    .catch(error => {
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error
      });
    });
};

const operatorsService = {
  fetchOperators
};

export { operatorsService, fetchOperators };
