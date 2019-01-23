import axios from 'axios';
import * as _ from 'lodash-es';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';

const gitHubURL = 'https://api.github.com';
const operatorsRepo = `operator-framework/community-operators`;
const operatorFileQuery = `*.clusterserviceversion.yaml`;

const allOperatorsRequest = `${gitHubURL}/search/code?q=repo:${operatorsRepo}+filename:${operatorFileQuery}`;
const operatorContentsURL = `${gitHubURL}/repos/${operatorsRepo}/contents`;

const fetchOperators = operatorName => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  const request = operatorName
    ? `${gitHubURL}/search/code?q='displayName: ${operatorName}'+repo:${operatorsRepo}+filename:${operatorFileQuery}`
    : allOperatorsRequest;

  axios.get(request).then(response => {
    const operatorFiles = response.data.items;
    const operatorRequests = [];

    _.forEach(operatorFiles, operatorFile => {
      operatorRequests.push(axios.get(`${operatorContentsURL}/${operatorFile.path}`));
    });

    return axios.all(operatorRequests).then(({ ...allResults }) => {
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
      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
        payload: operators
      });
      return operators;
    });
  });
};

const operatorsService = {
  fetchOperators
};

export { operatorsService, fetchOperators };
