// package: api
// file: registry.proto

import * as registry_pb from "./registry_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RegistryListPackages = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof registry_pb.ListPackageRequest;
  readonly responseType: typeof registry_pb.PackageName;
};

type RegistryGetPackage = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof registry_pb.GetPackageRequest;
  readonly responseType: typeof registry_pb.Package;
};

type RegistryGetBundle = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof registry_pb.GetBundleRequest;
  readonly responseType: typeof registry_pb.Bundle;
};

type RegistryGetBundleForChannel = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof registry_pb.GetBundleInChannelRequest;
  readonly responseType: typeof registry_pb.Bundle;
};

type RegistryGetChannelEntriesThatReplace = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof registry_pb.GetAllReplacementsRequest;
  readonly responseType: typeof registry_pb.ChannelEntry;
};

type RegistryGetBundleThatReplaces = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof registry_pb.GetReplacementRequest;
  readonly responseType: typeof registry_pb.Bundle;
};

type RegistryGetChannelEntriesThatProvide = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof registry_pb.GetAllProvidersRequest;
  readonly responseType: typeof registry_pb.ChannelEntry;
};

type RegistryGetLatestChannelEntriesThatProvide = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof registry_pb.GetLatestProvidersRequest;
  readonly responseType: typeof registry_pb.ChannelEntry;
};

type RegistryGetDefaultBundleThatProvides = {
  readonly methodName: string;
  readonly service: typeof Registry;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof registry_pb.GetDefaultProviderRequest;
  readonly responseType: typeof registry_pb.Bundle;
};

export class Registry {
  static readonly serviceName: string;
  static readonly ListPackages: RegistryListPackages;
  static readonly GetPackage: RegistryGetPackage;
  static readonly GetBundle: RegistryGetBundle;
  static readonly GetBundleForChannel: RegistryGetBundleForChannel;
  static readonly GetChannelEntriesThatReplace: RegistryGetChannelEntriesThatReplace;
  static readonly GetBundleThatReplaces: RegistryGetBundleThatReplaces;
  static readonly GetChannelEntriesThatProvide: RegistryGetChannelEntriesThatProvide;
  static readonly GetLatestChannelEntriesThatProvide: RegistryGetLatestChannelEntriesThatProvide;
  static readonly GetDefaultBundleThatProvides: RegistryGetDefaultBundleThatProvides;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class RegistryClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  listPackages(requestMessage: registry_pb.ListPackageRequest, metadata?: grpc.Metadata): ResponseStream<registry_pb.PackageName>;
  getPackage(
    requestMessage: registry_pb.GetPackageRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Package|null) => void
  ): UnaryResponse;
  getPackage(
    requestMessage: registry_pb.GetPackageRequest,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Package|null) => void
  ): UnaryResponse;
  getBundle(
    requestMessage: registry_pb.GetBundleRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getBundle(
    requestMessage: registry_pb.GetBundleRequest,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getBundleForChannel(
    requestMessage: registry_pb.GetBundleInChannelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getBundleForChannel(
    requestMessage: registry_pb.GetBundleInChannelRequest,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getChannelEntriesThatReplace(requestMessage: registry_pb.GetAllReplacementsRequest, metadata?: grpc.Metadata): ResponseStream<registry_pb.ChannelEntry>;
  getBundleThatReplaces(
    requestMessage: registry_pb.GetReplacementRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getBundleThatReplaces(
    requestMessage: registry_pb.GetReplacementRequest,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getChannelEntriesThatProvide(requestMessage: registry_pb.GetAllProvidersRequest, metadata?: grpc.Metadata): ResponseStream<registry_pb.ChannelEntry>;
  getLatestChannelEntriesThatProvide(requestMessage: registry_pb.GetLatestProvidersRequest, metadata?: grpc.Metadata): ResponseStream<registry_pb.ChannelEntry>;
  getDefaultBundleThatProvides(
    requestMessage: registry_pb.GetDefaultProviderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
  getDefaultBundleThatProvides(
    requestMessage: registry_pb.GetDefaultProviderRequest,
    callback: (error: ServiceError|null, responseMessage: registry_pb.Bundle|null) => void
  ): UnaryResponse;
}

