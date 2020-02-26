import store from './store';
import { AUTOSAVE_FIELDS, LOCAL_STORAGE_KEY } from '../utils/constants';

let lastStateSnapshot: Record<string, any> | null = null;

const autoSaveFieldsChanged = state => {
  const snapshot = lastStateSnapshot || {}; 

  const changed = AUTOSAVE_FIELDS.some(field => {
    const snapshotValue = snapshot[field];
    const stateFieldValue = state.editorState[field];

    return snapshotValue !== stateFieldValue;
  });

  return changed;
};

const takeSnapshot = state =>
  AUTOSAVE_FIELDS.reduce((aggregator, field) => {
    aggregator[field] = state.editorState[field];

    return aggregator;
  }, {});

const saveSnapshot = state => {
  lastStateSnapshot = takeSnapshot(state);
};

const saveEditorData = state => {
  let success = true;

  const snapshot = takeSnapshot(state);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    success = false;
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
