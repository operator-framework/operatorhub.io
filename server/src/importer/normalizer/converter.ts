import sharp from 'sharp';

import { Operator } from "./types";
import { normalizeVersion, normalizeCapabilityLevel, normalizeCRDs, isGlobalOperator } from './utils';
import logger from '../utils/logger';
import { Packages, OperatorChannel } from '../types';
import { NormalizedOperator, NormalizedOperatorPackage, NormalizedOperatorChannel } from '../../sharedTypes';

/**
 * Convert single operator bundle into desired output format for use with OperatorHub.io
 * @param operator
 * @param packageName
 * @param channelName
 */
async function normalizeOperator(operator: Operator, packageName: string, channelName: string) {

  const metadata = operator.metadata || {};
  const annotations = metadata.annotations || {};
  const spec = operator.spec || {};
  const iconObj = (spec.icon || [])[0];
  const categoriesString = annotations.categories || '';

  let thumbBase64 = '';
  let imageBase64 = '';

  if (iconObj) {
    imageBase64 = `data:${iconObj.mediatype};base64,${iconObj.base64data}`;

    try {
      // generate small thumbnail from full size image
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
      thumbBase64 = imageBase64;
    }
  }

  const UNKNOWN = 'UNKNOWN';

  let operatorMetadata: NormalizedOperator | null = null;

  try {

    operatorMetadata = {
      name: metadata.name || UNKNOWN,
      displayName: spec.displayName || metadata.name || UNKNOWN,
      imgUrl: imageBase64,
      thumbUrl: thumbBase64,
      longDescription: spec.description || annotations.description || '',
      provider: spec.provider && spec.provider.name || '',
      version: spec.version,
      versionForCompare: normalizeVersion(spec.version),
      replaces: spec.replaces || '',
      capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
      links: spec.links || [],
      repository: annotations.repository || '',
      maintainers: spec.maintainers || [],
      managedBy: annotations['app.kubernetes.io/managed-by'],
      helmRepoName: annotations['app.kubernetes.io/helm-repo-name'],
      helmRepoUrl: annotations['app.kubernetes.io/helm-repo-url'],
      helmChart: annotations['app.kubernetes.io/helm-chart'],
      description: annotations.description || '',
      categories: categoriesString.split(',').map(category => category.trim()),
      keywords: spec.keywords || [],
      createdAt: annotations.createdAt,
      containerImage: annotations.containerImage,
      customResourceDefinitions: normalizeCRDs(operator),
      packageName: packageName,
      channel: channelName,
      globalOperator: isGlobalOperator(spec.installModes)
    };

  } catch (e) {
    logger.error(`Can't normalize operator "${metadata.name}" as it contains invalid data`, e);
  }

  return operatorMetadata;
};


/**
 * Convert package metadata into desired output format
 * @param packageSet
 */
export async function normalizePackages(packageSet: Packages) {

  const packages = packageSet.values();
  const normalizedPackages: NormalizedOperatorPackage[] = [];

  let currentPackage = packages.next();

  while (!currentPackage.done) {
    const packageData = currentPackage.value;

    // ensure that all channels are processed before we continue further!
    const normalizedChannels = await Promise.all(packageData.channelsList.map(
      async channel => await normalizeChannel(channel, packageData.name)
    ));

    const normalizedPackage: NormalizedOperatorPackage = {
      ...packageData,
      channelsList: normalizedChannels
    };

    normalizedPackages.push(normalizedPackage);

    console.log('pkg done ', packageData.name)
    currentPackage = packages.next();
  }

  console.log('All packages normalized');

  return normalizedPackages;
}

/**
 * Convert single channel metadata into desired output format
 */
async function normalizeChannel(channel: OperatorChannel, packageName: string) {

  let normalizedChannel: NormalizedOperatorChannel = {
    ...channel,
    csvFiles: []
  }

  const normalizedOperators = await Promise.all(
    channel.csvFiles.map(
      async operator => await normalizeOperator(operator, packageName, channel.name)
    )
  )

  normalizedChannel = {
    ...normalizedChannel,
    csvFiles: normalizedOperators.filter(operator => operator !== null) as NormalizedOperator[]
  }

  return normalizedChannel;
}
