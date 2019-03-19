import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { installModeDescriptors, operatorFieldDescriptions } from '../../utils/operatorDescriptors';

const InstallModeEditor = ({ operator, onUpdate }) => {
  const updateInstallModes = (value, modeType, installModes) => {
    const installMode = _.find(installModes, { type: modeType });
    const nevValue = _.isString(value) ? value === 'true' : value;

    if (installMode) {
      installMode.supported = nevValue;
    } else {
      const newMode = {
        type: modeType,
        supported: nevValue
      };
      installModes.push(newMode);
    }

    onUpdate(installModes);
  };

  const renderInstallMode = (installModeType, installModes) => {
    const installMode = _.find(installModes, { type: installModeType });

    return (
      <tr key={installModeType}>
        <td className="oh-operator-editor-form__install-modes-table__mode-type top-bordered">{installModeType}</td>
        <td className="top-bordered">
          <input
            type="radio"
            name={installModeType}
            value
            checked={_.get(installMode, 'supported', false)}
            onChange={e => updateInstallModes(e.target.value, installModeType, installModes)}
          />
        </td>
        <td className="top-bordered">
          <input
            type="radio"
            name={installModeType}
            value={false}
            checked={!_.get(installMode, 'supported', false)}
            onChange={e => updateInstallModes(e.target.value, installModeType, installModes)}
          />
        </td>
        <td>{installModeDescriptors[installModeType]}</td>
      </tr>
    );
  };

  const installModes = _.get(operator, 'spec.installModes', []);

  return (
    <table className="oh-operator-editor-form__install-modes-table">
      <tbody>
        <tr>
          <th />
          <th>True</th>
          <th>False</th>
          <th />
        </tr>
        {renderInstallMode('OwnNamespace', installModes)}
        {renderInstallMode('SingleNamespace', installModes)}
        {renderInstallMode('MultiNamespace', installModes)}
        {renderInstallMode('AllNamespaces', installModes)}
      </tbody>
    </table>
  );
};

InstallModeEditor.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default InstallModeEditor;
