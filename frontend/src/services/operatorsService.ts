import axios from 'axios';

import { PENDING_ACTION, FULFILLED_ACTION, REJECTED_ACTION } from '../common/helpers';
import { reduxConstants } from '../redux/constants';
import { IDispatch } from '../redux';

const serverHost = process.env.DEV_HOST || 'https://dev.operatorhub.io';
const serverPort = process.env.DEV_PORT;
const serverURL = serverPort ? `${serverHost}:${serverPort}` : serverHost;

const allOperatorsRequest = process.env.DEV_MODE ? `${serverURL}/api/operators` : `/api/operators`;
const operatorRequest = process.env.DEV_MODE ? `${serverURL}/api/operator` : `/api/operator`;
const latestOlmVersionRequest = 'https://api.github.com/repos/operator-framework/operator-lifecycle-manager/releases';

export const fetchOperator = (packageName: string, channel?: string, operatorName?: string) => (dispatch: IDispatch)  => {
  dispatch({
    type: PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

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
        type: FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
        payload: response.data.operator
      });
    })
    .catch(e => {
      dispatch({
        type: REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error: e
      });
    });
};

let lastOperatorsFetchTime = 0;
let operatorsCache = [];

export const fetchOperators = () => (dispatch: IDispatch) => {
  dispatch({
    type: PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (Date.now() - lastOperatorsFetchTime < 3600 * 1000 && operatorsCache.length > 0) {
    dispatch({
      type: FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
      // create new array so reference is different
      payload: operatorsCache.slice(0)
    });
    return;
  }

  axios
    .get(allOperatorsRequest)
    .then(response => {
      const { operators } = response.data;

      operatorsCache = operators;
      lastOperatorsFetchTime = Date.now();

      dispatch({
        type: FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
        payload: operators
      });
    })
    .catch(e => {
      console.dir(e);
      dispatch({
        type: REJECTED_ACTION(reduxConstants.GET_OPERATORS),
        error: e
      });
    });
};

export const fetchLatestOlmVersion = () => (dispatch: IDispatch) => {
  dispatch({
    type: PENDING_ACTION(reduxConstants.GET_OLM_VERSION)
  });

  axios
    .get(latestOlmVersionRequest)
    .then(response => {
      const latestRelease = response.data.filter(release => release.draft !== true)[0];

      if (latestRelease && latestRelease.tag_name) {
        dispatch({
          type: FULFILLED_ACTION(reduxConstants.GET_OLM_VERSION),
          payload: latestRelease.tag_name
        });
      } else {
        dispatch({
          type: REJECTED_ACTION(reduxConstants.GET_OLM_VERSION),
          error: null
        });
      }
    })
    .catch(e => {
      console.dir(e);
      dispatch({
        type: REJECTED_ACTION(reduxConstants.GET_OLM_VERSION),
        error: e
      });
    });
};
