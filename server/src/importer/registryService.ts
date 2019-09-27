
import grpc from 'grpc';

import { RegistryClient} from '../../proto/registry_grpc_pb';
import { RegistryClient as IRegistryClient } from '../../proto/registry_pb_service';
import { REGISTRY_ADDRESS } from '../utils/constants';


export const registryService: IRegistryClient = new RegistryClient(REGISTRY_ADDRESS, grpc.credentials.createInsecure());