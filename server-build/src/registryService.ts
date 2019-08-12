
import * as grpc from 'grpc';

import { RegistryClient} from '../proto/registry_grpc_pb';
import { RegistryClient as IRegistryClient } from '../proto/registry_pb_service';


export const registryService: IRegistryClient = new RegistryClient('localhost:50051', grpc.credentials.createInsecure());