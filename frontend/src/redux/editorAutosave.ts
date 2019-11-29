import store from './store';
import { AUTOSAVED_FIELDS, LOCAL_STORAGE_KEY, AUTOSAVED_STATE } from '../utils/constants';
import { StoreState } from '.';

let lastStateSnapshot: Record<string, any> | null = null;

const autoSaveFieldsChanged = (state: StoreState) => {
  const snapshot = lastStateSnapshot || {}; 



  const changed = AUTOSAVED_FIELDS.some(field => {
    const snapshotValue = snapshot[field];
    const stateFieldValue = state[AUTOSAVED_STATE][field];

    return snapshotValue !== stateFieldValue;
  });

  return changed;
};

const takeSnapshot = (state: StoreState) =>
  AUTOSAVED_FIELDS.reduce((aggregator, field) => {
    aggregator[field] = state[AUTOSAVED_STATE][field];

    return aggregator;
  }, {});

const saveSnapshot = (state: StoreState) => {
  lastStateSnapshot = takeSnapshot(state);
};

const saveEditorData = (state: StoreState) => {
  let success = true;

  const snapshot = takeSnapshot(state);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));

  } catch (domException) {

    success = false;
      if (domException.name === 'QuotaExceededError' ||
          domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        
            // @TODO: how to recover from out of storage

      }
  }

  return success;
};

const autoSaveEditor = () => {
  const state = store.getState();

  // take snapshot if not existing
  if (lastStateSnapshot === null) {
    saveSnapshot(state);
  } else if (autoSaveFieldsChanged(state)) {
    saveEditorData(state);
    saveSnapshot(state);
  }
};

export { autoSaveEditor };
