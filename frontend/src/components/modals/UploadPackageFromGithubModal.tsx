import React from 'react';
import { Modal, Alert } from 'patternfly-react';

import { PackageEntry, PackageFileEntry, PackageDirectoryEntry } from '../../utils/packageEditorTypes';
import OperatorInputWrapper from '../editor/forms/OperatorInputWrapper';
import Loader from '../other/Loader';


type FieldNames = 'repo' | 'path' | 'branch';

export interface UploadPackageFromGithubModalProps {

  onUpload: (entries: PackageEntry[]) => void
  onClose: () => void
  onError: (errorText: string) => void
}

interface UploadPackageFromGithubModalState {
  repo: string
  path: string
  branch: string
  validFields: Record<FieldNames, boolean>
  formErrors: Record<FieldNames, string | null>
  loading: boolean
  noResults: boolean
  totalItems: number
  loadedItems: number
}

class UploadPackageFromGithubModal extends React.PureComponent<UploadPackageFromGithubModalProps, UploadPackageFromGithubModalState> {


  state: UploadPackageFromGithubModalState = {
    repo: 'operator-framework/community-operators',
    path: 'upstream-community-operators/etcd',
    branch: 'master',
    validFields: {
      repo: true,
      path: true,
      branch: true
    },
    formErrors: {
      path: null,
      repo: null,
      branch: null
    },
    loading: false,
    noResults: false,
    totalItems: 0,
    loadedItems: 0
  };

  descriptions = {
    repo: 'Repository owner and name as shown in Github.',
    path: 'Path inside the repository to the folder which is operator package folder.',
    branch: 'Repository branch name to use.'
  }

  updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // @ts-ignore
    this.setState({ [name]: value })
  }

  validators = {
    repo: (value: string) => {
      return value.indexOf('/') > 0 ? null : 'Organization and repository name has to be as displayes on Gitbuh devided by slash.'
    },
    branch: (value: string) => {
      return value.length > 0 ? null : 'Branch name is mandatory.'
    },
    path: (value: string) => {
      return value.length > 0 ? null : 'Operator folder path is mandatory.'
    }
  }


  commitField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formErrors, validFields } = this.state;
    const { name, value } = e.target;

    const error = this.validators[name](value);

    this.setState({
      formErrors: {
        ...formErrors,
        [name]: error
      },
      validFields: {
        ...validFields,
        [name]: typeof error !== 'string'
      }
    });

    return error;
  }

  
  onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {

    if ((event.which === 13 || event.keyCode === 13)) {
        event.preventDefault();
        const { name, value } = event.target as HTMLInputElement;

        const validationResult = this.commitField(event as any);

        if (validationResult === null) {
          const {validFields} = this.state;

          const allValid = Object.values(validFields).every(field => field);

          allValid && this.upload();
        }
    }
};

  fetchFileContent = (json: any, nested: boolean, pathBase: string) => {

    const entry: PackageFileEntry = {
      kind: 'file',
      path: json.path.replace(pathBase, ''),
      name: json.name,
      nested,
      objectName: json.name.replace('.yaml', ''),
      objectType: 'Unknown',
      version: '',
      content: ''
    };

    return fetch(json.download_url)
      .then(response => response.text())
      .then(content => {
        entry.content = content;

        return entry;
      });
  }

  fetchFolderContent = (json: any, pathBase: string) => {

    const entry: PackageDirectoryEntry = {
      kind: 'dir',
      path: json.path.replace(pathBase, ''),
      name: json.name,
      nested: false,
      objectName: '/',
      objectType: 'Folder',
      content: []
    };

    return fetch(json.url)
      .then(response => response.json())
      .then((content: any[]) => {

        const filePromises: Promise<PackageFileEntry>[] = [];

        content.forEach(file => {

          if (file.type === 'file') {
            filePromises.push(this.fetchFileContent(file, true, pathBase));
          }
        });

        this.setState({
          totalItems: this.state.totalItems + filePromises.length
        })

        return Promise.all(filePromises)
          .then(files => {
            entry.content = files;

            this.setState({
              loadedItems: this.state.loadedItems + files.length
            })

            return entry;
          });
      });
  };

  listContent = (url: string, pathBase: string) => fetch(url)
    .then(response => response.json())
    .then((json: any[]) => {

      // ensure we have folder with package file and version
      if (Array.isArray(json) && json.length > 1) {

        // promises with files and folders content
        const readPromises: (Promise<PackageEntry>)[] = [];

        json.forEach(item => {
          if (item.type === 'file') {
            readPromises.push(this.fetchFileContent(item, false, pathBase));

            this.setState({ totalItems: this.state.totalItems + 1 });

          } else if (item.type === 'dir') {
            readPromises.push(this.fetchFolderContent(item, pathBase));
          }
        });

        return Promise.all(readPromises);
      }
      return [];
    });

  upload = () => {
    const { onUpload, onClose, onError } = this.props;
    const { repo, path, branch } = this.state;

    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

    this.setState({
      loading: true
    });

    this.listContent(url, path)
      .then(entries => {

        if (entries.length > 0) {
          onClose();
          onUpload(entries);

        } else {
          // let user know that path was likely wrong
          this.setState({ noResults: true, loading: false });
        }
      })
      .catch(e => {
        const errorText = typeof e === 'string' ? e : e.message || 'Unexpected error happened.';
        onError(errorText);
      });
  }

  closeNoResultsWarning = () => {
    this.setState({ noResults: false });
  }

  render() {
    const { onClose } = this.props;
    const { repo, path, branch, formErrors, validFields, loading, noResults, loadedItems, totalItems } = this.state;

    const allValid = Object.values(validFields).every(field => field);

    return (
      <Modal show onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf oh-operator-editor-page">
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>Upload Package from Github</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            loading &&
            <Loader
              text={<span>{`Loading package content. Fetched ${loadedItems} of ${totalItems} files.`}</span>}
            />
          }          
          {!loading &&
            <form className="oh-operator-editor-form">
              <OperatorInputWrapper
                title="Repository path"
                descriptions={this.descriptions}
                field="repo"
                formErrors={formErrors}
                key="repo"
              >
                <input
                  className="form-control"
                  name="repo"
                  type="text"
                  onFocus={this.closeNoResultsWarning}
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  onKeyDown={this.onKeyDown}
                  placeholder="e.g. operator-framework/operatorhub.io"
                  value={repo}
                />
              </OperatorInputWrapper>
              <OperatorInputWrapper
                title="Operator package path"
                descriptions={this.descriptions}
                field="path"
                formErrors={formErrors}
                key="path"
              >
                <input
                  className="form-control"
                  name="path"
                  type="text"
                  onFocus={this.closeNoResultsWarning}
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  onKeyDown={this.onKeyDown}
                  placeholder="e.g. upstream-community-operators/etcd"
                  value={path}
                />
              </OperatorInputWrapper>
              <OperatorInputWrapper
                title="Branch"
                descriptions={this.descriptions}
                field="branch"
                formErrors={formErrors}
                key="branch"
              >
                <input
                  className="form-control"
                  name="branch"
                  type="text"
                  onFocus={this.closeNoResultsWarning}
                  onChange={this.updateField}
                  onBlur={this.commitField}
                  onKeyDown={this.onKeyDown}
                  placeholder="e.g. master"
                  value={branch}
                />
              </OperatorInputWrapper>
            </form>
          }
          {
            noResults && (
              <Alert bsStyle="warning" onDismiss={this.closeNoResultsWarning}>
                <p>No operator data found at specified repository and operator path. Please revalidate data.</p>              
              </Alert>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <button className="oh-button oh-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="oh-button oh-button-primary" onClick={this.upload} disabled={!allValid}>
            Upload
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}



export default UploadPackageFromGithubModal;
