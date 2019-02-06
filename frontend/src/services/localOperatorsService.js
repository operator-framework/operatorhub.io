import axios from 'axios';
import * as _ from 'lodash-es';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';
import { normalizeOperators, getVersionedOperators } from '../utils/operatorUtils';
import { mockOperators } from '../__mock__/operators';

const allOperatorsRequest = `/api/operators`;

const fetchOperators = operatorName => dispatch => {
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
      console.dir(response);
      const responseOperators = response.data.operators;
      const normalizedOperators = normalizeOperators(responseOperators);
      const operators = getVersionedOperators(normalizedOperators);

      if (operatorName) {
        const operator = _.find(operators, { name: operatorName });
        if (operator) {
          dispatch({
            type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
            payload: operator
          });
        }
        return;
      }
      dispatch({
        type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
        payload: operators
      });
    })
    .catch(error => {
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error
      });
    });
};

const localOperatorsService = {
  fetchOperators
};

export { localOperatorsService, fetchOperators };
