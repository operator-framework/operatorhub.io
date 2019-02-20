import axios from 'axios';
import * as _ from 'lodash-es';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';
import { getVersionedOperators } from '../utils/operatorUtils';
import { mockOperators } from '../__mock__/operators';

const serverHost = process.env.DEV_HOST || 'localhost';
const serverPort = process.env.DEV_PORT || 8080;
const serverURL = `http://${serverHost}:${serverPort}`;

const allOperatorsRequest = process.env.DEV_MODE ? `${serverURL}/api/operators` : `/api/operators`;
const operatorRequest = process.env.DEV_MODE ? `${serverURL}/api/operator` : `/api/operator`;

const fetchOperator = operatorName => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (process.env.MOCK_MODE) {
    const versionedOperator = _.find(mockOperators, { name: operatorName });
    const operators = _.filter(mockOperators, { displayName: versionedOperator.displayName });
    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
      payload: operators[0]
    });
    return;
  }

  const config = { params: { name: operatorName } };
  axios
    .get(operatorRequest, config)
    .then(response => {
      const responseOperators = response.data.operators;
      const operators = getVersionedOperators(responseOperators);

      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
        payload: operators[0]
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
      payload: getVersionedOperators(_.cloneDeep(mockOperators))
    });
    return;
  }

  axios
    .get(allOperatorsRequest)
    .then(response => {
      const responseOperators = response.data.operators;
      const operators = getVersionedOperators(responseOperators);

      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
        payload: operators
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
