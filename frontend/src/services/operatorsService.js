import axios from 'axios';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';

const serverHost = process.env.DEV_HOST || 'localhost';
const serverPort = process.env.DEV_PORT || 8080;
const serverURL = `http://${serverHost}:${serverPort}`;

const allOperatorsRequest = process.env.DEV_MODE ? `${serverURL}/api/operators` : `/api/operators`;
const operatorRequest = process.env.DEV_MODE ? `${serverURL}/api/operator` : `/api/operator`;
const latestOlmVersionRequest = 'https://api.github.com/repos/operator-framework/operator-lifecycle-manager/releases';

export const fetchOperator = (operatorName, packageName, channel) => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
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

export const fetchOperators = () => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

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

export const fetchLatestOlmVersion = () => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OLM_VERSION)
  });

  axios
    .get(latestOlmVersionRequest)
    .then(response => {
      const latestRelease = response.data.filter(release => release.target_commitish === 'master')[0];

      if (latestRelease && latestRelease.tag_name) {
        dispatch({
          type: helpers.FULFILLED_ACTION(reduxConstants.GET_OLM_VERSION),
          payload: latestRelease.tag_name
        });
      } else {
        dispatch({
          type: helpers.REJECTED_ACTION(reduxConstants.GET_OLM_VERSION),
          error: null
        });
      }
    })
    .catch(e => {
      console.dir(e);
      dispatch({
        type: helpers.REJECTED_ACTION(reduxConstants.GET_OLM_VERSION),
        error: e
      });
    });
};
