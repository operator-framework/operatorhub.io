import { reduxConstants } from '../constants';

export const storePreviewYamlAction = (yaml: string, yamlChanged: boolean) =>
    ({
        type: reduxConstants.SET_PREVIEW_YAML,
        yaml,
        yamlChanged
    });

export const storeContentHeightAction = (contentHeight: number) =>
    ({
        type: reduxConstants.SET_PREVIEW_CONTENT_HEIGHT,
        contentHeight
    });


    