/* eslint-disable no-undef */
import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import { safeDump } from 'js-yaml';
import { Icon } from 'patternfly-react';

import { noop } from '../../common/helpers';
import {
  getMissingCrdUploads,
  yamlFromOperator,
  operatorNameFromOperator,
  filterValidCrdUploads,
  getUpdatedFormErrors
} from '../../pages/operatorBundlePage/bundlePageUtils';
import { removeEmptyOptionalValuesFromOperator, validateOperatorPackage } from '../../utils/operatorValidation';
import { reduxConstants } from '../../redux/constants';
import { setBatchSectionsStatusAction } from '../../redux/actions/editorActions';
import { sectionsFields, EDITOR_STATUS } from '../../utils/constants';

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
      window.scroll(0, 0);
    }
  };

  validateAllSections = () => {
    const { operator, operatorPackage, setBatchSectionsStatus } = this.props;

    const updatedSectionsStatus = {};
    // remove invalid defaults before validation so they do not cause false errors
    const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

    let operatorIsValid = true;

    // iterate over sections to update its state so user see where errors happened
    Object.keys(sectionsFields).forEach(sectionName => {
      const fields = sectionsFields[sectionName];
      const sectionErrors = getUpdatedFormErrors(cleanedOperator, {}, fields);

      // check if some section field has error
      const sectionHasErrors = _.castArray(fields).some(field => _.get(sectionErrors, field));

      if (sectionHasErrors) {
        updatedSectionsStatus[sectionName] = EDITOR_STATUS.errors;
        operatorIsValid = false;
      }
    });

    const packageIsValid = validateOperatorPackage(operatorPackage);

    // validate package
    if (!packageIsValid) {
      updatedSectionsStatus.package = EDITOR_STATUS.errors;
    }

    if (Object.keys(updatedSectionsStatus).length > 0) {
      setBatchSectionsStatus(updatedSectionsStatus);
    }

    return operatorIsValid && packageIsValid;
  };

  prepareBundle = () => {
    const { sectionStatus, showBundleConfirm, showErrorModal } = this.props;
    const everythingIsValid = this.validateAllSections();

    const sectionsDone = Object.values(sectionStatus).every(section =>
      [EDITOR_STATUS.complete, EDITOR_STATUS.empty].includes(section)
    );
    // check errors first
    if (everythingIsValid === false) {
      showErrorModal();
      // check if sections are done once there are no errors
    } else if (sectionsDone) {
      this.generateBundle();
    } else {
      // we can proceed after warning
      showBundleConfirm(this.generateBundleAndCloseWarning);
    }
  };

  generateBundleAndCloseWarning = () => {
    const { hideConfirmModal } = this.props;

    hideConfirmModal();
    this.generateBundle();
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
      // delayed as closing modal breaks scroll position :()
      // setTimeout(this.scrollToUploader, 500);
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
    return (
      <React.Fragment>
        <button className="oh-button oh-button-primary" onClick={this.prepareBundle}>
          Download Operator Bundle
        </button>
        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
      </React.Fragment>
    );
  }
}

OperatorBundleDownloader.propTypes = {
  operator: PropTypes.object,
  uploads: PropTypes.array,
  sectionStatus: PropTypes.object,
  operatorPackage: PropTypes.object,
  showBundleConfirm: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  showErrorModal: PropTypes.func,
  setBatchSectionsStatus: PropTypes.func
};

OperatorBundleDownloader.defaultProps = {
  operator: {},
  sectionStatus: {},
  uploads: [],
  operatorPackage: {},
  showBundleConfirm: noop,
  hideConfirmModal: noop,
  showErrorModal: noop,
  setBatchSectionsStatus: noop
};

const mapDispatchToProps = dispatch => ({
  setBatchSectionsStatus: status => dispatch(setBatchSectionsStatusAction(status)),
  showBundleConfirm: onConfirm =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Download Bundle',
      heading: (
        <span>Are you sure you want to download operator bundle while some editor sections are not review yet?</span>
      ),
      confirmButtonText: 'Download',
      cancelButtonText: 'Cancel',
      onConfirm,
      restoreFocus: false
    }),
  hideConfirmModal: () =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_HIDE
    }),
  showErrorModal: () =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Operator validation error',
      icon: <Icon type="pf" name="error-circle-o" />,
      heading: 'Operator contains errors. Please fix them before bundle is created.',
      confirmButtonText: 'OK'
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  sectionStatus: state.editorState.sectionStatus,
  uploads: state.editorState.uploads,
  operatorPackage: state.editorState.operatorPackage
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorBundleDownloader);
