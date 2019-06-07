import axios from 'axios';
import * as _ from 'lodash-es';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';
import { mockOperators } from '../__mock__/operators';

const serverHost = process.env.DEV_HOST || 'localhost';
const serverPort = process.env.DEV_PORT || 8080;
const serverURL = `http://${serverHost}:${serverPort}`;

const allOperatorsRequest = process.env.DEV_MODE ? `${serverURL}/api/operators` : `/api/operators`;
const operatorRequest = process.env.DEV_MODE ? `${serverURL}/api/operator` : `/api/operator`;

const fetchOperator = (operatorName, packageName, channel) => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (process.env.MOCK_MODE) {
    const operator = _.find(mockOperators, { name: operatorName });
    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
      payload: operator
    });
    return;
  }

  const config = {
    params: {
      name: operatorName,
      channel,
      packageName
    }
  };
  axios
    .get(operatorRequest, config)
    .then(response => {
      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
        payload: response.data.operator
      });
    })
    .catch(e => {
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error: e
      });
    });
};

const fetchOperators = () => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (process.env.MOCK_MODE) {
    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
      payload: _.cloneDeep(mockOperators)
    });
    return;
  }

  axios
    .get(allOperatorsRequest)
    .then(response => {
      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
        payload: response.data.operators
      });
    })
    .catch(e => {
      console.dir(e);
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error: e
      });
    });
};

const operatorsService = {
  fetchOperator,
  fetchOperators
};

export { operatorsService, fetchOperator, fetchOperators };
