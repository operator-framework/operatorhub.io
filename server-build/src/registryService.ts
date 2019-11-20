
import * as grpc from 'grpc';

import { RegistryClient} from '../proto/registry_grpc_pb';
import { RegistryClient as IRegistryClient } from '../proto/registry_pb_service';
import { REGISTRY_ADDRESS, REGISTRY_PORT } from './constants';


export const registryService: IRegistryClient = new RegistryClient(`${REGISTRY_ADDRESS}:${REGISTRY_PORT}`, grpc.credentials.createInsecure());