import sharp from 'sharp';
import _ from 'lodash';
import { normalizeVersion, normalizeCapabilityLevel, normalizeCRDs, isGlobalOperator } from '../normalizer/utils';
import { NormalizedOperator, NormalizedOperatorPackage } from '../../sharedTypes';

const env = process.env || {};

export const operatorsDirectory =
    env.OPERATORS_DIR === undefined ? 'upstream-community-operators' : process.env.OPERATORS_DIR;


const normalizeOperator = async (operator): Promise<NormalizedOperator> => {
    const annotations = _.get(operator, 'metadata.annotations', {});
    const spec = _.get(operator, 'spec', {});
    const iconObj = _.get(spec, 'icon[0]');
    const categoriesString = _.get(annotations, 'categories');
    const packageInfo = _.get(operator, 'packageInfo', {});

    let thumbBase64;

    if (iconObj) {
        try {
            const imageBuffer = Buffer.from(iconObj.base64data, 'base64');

            const resizedBuffer = await sharp(imageBuffer)
                .resize({
                    height: 80,
                    fit: 'inside',
                    background: 'rgb(255,255,255)'
                })
                .flatten({ background: 'rgb(255,255,255)' })
                .sharpen()
                .toFormat('jpeg')
                .toBuffer();

            const resizedBase64 = resizedBuffer.toString('base64');
            thumbBase64 = `data:image/jpeg;base64,${resizedBase64}`;
        } catch (e) {
            console.warn(`Can't create thumbnail for operator ${operator.metadata.name} using original as fallback`);
            thumbBase64 = iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '';
        }
    }

    return {
        name: operator.metadata.name,
        displayName: _.get(spec, 'displayName', operator.metadata.name),
        imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
        thumbUrl: thumbBase64 || '',
        longDescription: _.get(spec, 'description', annotations.description),
        provider: _.get(spec, 'provider.name'),
        version: spec.version,
        versionForCompare: normalizeVersion(spec.version),
        replaces: spec.replaces,
        capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
        links: spec.links,
        repository: annotations.repository,
        maintainers: spec.maintainers,
        managedBy: annotations['app.kubernetes.io/managed-by'],
        helmRepoName: annotations['app.kubernetes.io/helm-repo-name'],
        helmRepoUrl: annotations['app.kubernetes.io/helm-repo-url'],
        helmChart: annotations['app.kubernetes.io/helm-chart'],
        description: _.get(annotations, 'description'),
        categories: categoriesString && _.map(categoriesString.split(','), category => category.trim()),
        keywords: spec.keywords,
        createdAt: annotations.createdAt,
        containerImage: annotations.containerImage,
        customResourceDefinitions: normalizeCRDs(operator),
        packageName: packageInfo.packageName,
        globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
    } as NormalizedOperator;
};

export const normalizeOperators = operators =>
    Promise.all<NormalizedOperator>(operators.map(operator => normalizeOperator(operator)));


const findReplacedCsv = (latestOperatorName: string, operators: NormalizedOperator[]) => {
    const ordered: NormalizedOperator[] = [];

    let lastOperator = operators.find(op => op.name === latestOperatorName);

    while (lastOperator) {
        ordered.push(lastOperator);

        lastOperator = lastOperator.replaces ? operators.find(op => op.name === (lastOperator as NormalizedOperator).replaces) : undefined;
    }

    return ordered;
}

const normalizePackage = (operatorPackage, operators: NormalizedOperator[]) => {
    const packageName = operatorPackage.packageName;
    const packageCsvs = operators.filter(csv => csv.packageName === packageName);


    const normalizedPackage: NormalizedOperatorPackage = {
        name: packageName,
        defaultChannelName: operatorPackage.defaultChannel || operatorPackage.channels[0].name,
        channelsList: operatorPackage.channels.map(channel => {
            const channelOperators = findReplacedCsv(channel.currentCSV, packageCsvs);

            return {
                name: channel.name,
                latestCsvName: channel.currentCSV,
                csvNamesList: channelOperators.map(op => ({
                    name: op.name,
                    version: op.version
                })),
                csvFiles: channelOperators.map(op => {
                    op.channel = channel.name;
                    return op;
                })
            };
        })
    }

    return normalizedPackage;
};

export const normalizePackages = (packages: any[], operators: NormalizedOperator[]) =>
    packages.map(operatorPackage => normalizePackage(operatorPackage, operators));