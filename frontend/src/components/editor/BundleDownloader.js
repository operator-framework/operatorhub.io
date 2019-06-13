import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as _ from 'lodash-es';
import JSZip from 'jszip';
import { safeDump } from 'js-yaml';
import {
  getMissingCrdUploads,
  yamlFromOperator,
  operatorNameFromOperator,
  filterValidCrdUploads
} from '../../pages/operatorBundlePage/bundlePageUtils';
import { removeEmptyOptionalValuesFromOperator } from '../../utils/operatorUtils';

class OperatorBundleDownloader extends React.PureComponent {
  generateAction = null;

  setGenerateAction = ref => {
    this.generateAction = ref;
  };

  /**
   * Build single channel package file for operator
   * @param {*} operatorPackage
   * @param {*} name full operator name with version
   */
  createPackageFile = (operatorPackage, name) => {
    let packageYaml = '';

    try {
      packageYaml = safeDump({
        packageName: operatorPackage.name,
        channels: [
          {
            name: operatorPackage.channel,
            currentCSV: name
          }
        ]
      });
    } catch (e) {
      console.error("Can't create package file.");
    }
    return packageYaml;
  };

  /**
   * Scroll to uploader so user see which CRD files are missing in bundle
   */
  scrollToUploader = () => {
    const uploader = document.getElementById('oh-operator--editor-page__manifest-uploader');

    // scroll to uploader if it exists
    if (uploader) {
      uploader.scrollIntoView();
    } else {
      // fallback to top in case something change
      window.scroll({ top: 0 });
    }
  };

  /**
   * Create bundle of CSV, CRDs and package file for operator
   */
  generateBundle = () => {
    const { operator, uploads, operatorPackage } = this.props;

    const hasMissingCrdUploads = getMissingCrdUploads(uploads, operator).length > 0;

    // do not allow dowloading bundle with missing CRDs
    if (hasMissingCrdUploads) {
      this.scrollToUploader();
      return;
    }

    // remove values which are part of default operator, but are invalid
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    let operatorYaml;
    try {
      operatorYaml = yamlFromOperator(cleanedOperator);
    } catch (e) {
      operatorYaml = '';
    }
    const name = operatorNameFromOperator(cleanedOperator);
    const shortName = _.get(operator, 'metadata.name');

    const uploadedCrds = filterValidCrdUploads(uploads);
    const packageYaml = this.createPackageFile(operatorPackage, name);

    const zip = new JSZip();

    zip.file(`${name}/${shortName}.package.yaml`, packageYaml);
    zip.file(`${name}/${name}.clusterserviceversion.yaml`, operatorYaml);

    // add CRDs
    uploadedCrds.forEach(crd => {
      let crdYaml = '';
      let crdName = '';

      try {
        crdYaml = safeDump(crd.data);
        crdName = crd.data.metadata.name;
      } catch (e) {
        console.warn(`Can't convert crd to yaml for ${crdName}`);
      }

      zip.file(`${name}/${crdName}.crd.yaml`, crdYaml);
    });

    zip.generateAsync({ type: 'base64' }).then(
      base64 => {
        this.generateAction.href = `data:application/zip;base64,${base64}`;
        this.generateAction.download = `${_.get(cleanedOperator, 'spec.displayName')}.bundle.zip`;
        this.generateAction.click();
      },
      err => {
        console.error(err);
      }
    );
  };

  render() {
    const { disabled } = this.props;

    const downloadClasses = classNames('oh-button oh-button-primary', { disabled });

    return (
      <React.Fragment>
        <button className={downloadClasses} disabled={disabled} onClick={this.generateBundle}>
          Download Operator Bundle
        </button>
        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
      </React.Fragment>
    );
  }
}

OperatorBundleDownloader.propTypes = {
  operator: PropTypes.object.isRequired,
  uploads: PropTypes.array.isRequired,
  operatorPackage: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default OperatorBundleDownloader;
