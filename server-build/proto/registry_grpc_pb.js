// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var registry_pb = require('./registry_pb.js');

function serialize_api_Bundle(arg) {
  if (!(arg instanceof registry_pb.Bundle)) {
    throw new Error('Expected argument of type api.Bundle');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_Bundle(buffer_arg) {
  return registry_pb.Bundle.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_ChannelEntry(arg) {
  if (!(arg instanceof registry_pb.ChannelEntry)) {
    throw new Error('Expected argument of type api.ChannelEntry');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_ChannelEntry(buffer_arg) {
  return registry_pb.ChannelEntry.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetAllProvidersRequest(arg) {
  if (!(arg instanceof registry_pb.GetAllProvidersRequest)) {
    throw new Error('Expected argument of type api.GetAllProvidersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetAllProvidersRequest(buffer_arg) {
  return registry_pb.GetAllProvidersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetAllReplacementsRequest(arg) {
  if (!(arg instanceof registry_pb.GetAllReplacementsRequest)) {
    throw new Error('Expected argument of type api.GetAllReplacementsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetAllReplacementsRequest(buffer_arg) {
  return registry_pb.GetAllReplacementsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetBundleInChannelRequest(arg) {
  if (!(arg instanceof registry_pb.GetBundleInChannelRequest)) {
    throw new Error('Expected argument of type api.GetBundleInChannelRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetBundleInChannelRequest(buffer_arg) {
  return registry_pb.GetBundleInChannelRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetBundleRequest(arg) {
  if (!(arg instanceof registry_pb.GetBundleRequest)) {
    throw new Error('Expected argument of type api.GetBundleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetBundleRequest(buffer_arg) {
  return registry_pb.GetBundleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetDefaultProviderRequest(arg) {
  if (!(arg instanceof registry_pb.GetDefaultProviderRequest)) {
    throw new Error('Expected argument of type api.GetDefaultProviderRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetDefaultProviderRequest(buffer_arg) {
  return registry_pb.GetDefaultProviderRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetLatestProvidersRequest(arg) {
  if (!(arg instanceof registry_pb.GetLatestProvidersRequest)) {
    throw new Error('Expected argument of type api.GetLatestProvidersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetLatestProvidersRequest(buffer_arg) {
  return registry_pb.GetLatestProvidersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetPackageRequest(arg) {
  if (!(arg instanceof registry_pb.GetPackageRequest)) {
    throw new Error('Expected argument of type api.GetPackageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetPackageRequest(buffer_arg) {
  return registry_pb.GetPackageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_GetReplacementRequest(arg) {
  if (!(arg instanceof registry_pb.GetReplacementRequest)) {
    throw new Error('Expected argument of type api.GetReplacementRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_GetReplacementRequest(buffer_arg) {
  return registry_pb.GetReplacementRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_ListPackageRequest(arg) {
  if (!(arg instanceof registry_pb.ListPackageRequest)) {
    throw new Error('Expected argument of type api.ListPackageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_ListPackageRequest(buffer_arg) {
  return registry_pb.ListPackageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_Package(arg) {
  if (!(arg instanceof registry_pb.Package)) {
    throw new Error('Expected argument of type api.Package');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_Package(buffer_arg) {
  return registry_pb.Package.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_api_PackageName(arg) {
  if (!(arg instanceof registry_pb.PackageName)) {
    throw new Error('Expected argument of type api.PackageName');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_api_PackageName(buffer_arg) {
  return registry_pb.PackageName.deserializeBinary(new Uint8Array(buffer_arg));
}


var RegistryService = exports.RegistryService = {
  listPackages: {
    path: '/api.Registry/ListPackages',
    requestStream: false,
    responseStream: true,
    requestType: registry_pb.ListPackageRequest,
    responseType: registry_pb.PackageName,
    requestSerialize: serialize_api_ListPackageRequest,
    requestDeserialize: deserialize_api_ListPackageRequest,
    responseSerialize: serialize_api_PackageName,
    responseDeserialize: deserialize_api_PackageName,
  },
  getPackage: {
    path: '/api.Registry/GetPackage',
    requestStream: false,
    responseStream: false,
    requestType: registry_pb.GetPackageRequest,
    responseType: registry_pb.Package,
    requestSerialize: serialize_api_GetPackageRequest,
    requestDeserialize: deserialize_api_GetPackageRequest,
    responseSerialize: serialize_api_Package,
    responseDeserialize: deserialize_api_Package,
  },
  getBundle: {
    path: '/api.Registry/GetBundle',
    requestStream: false,
    responseStream: false,
    requestType: registry_pb.GetBundleRequest,
    responseType: registry_pb.Bundle,
    requestSerialize: serialize_api_GetBundleRequest,
    requestDeserialize: deserialize_api_GetBundleRequest,
    responseSerialize: serialize_api_Bundle,
    responseDeserialize: deserialize_api_Bundle,
  },
  getBundleForChannel: {
    path: '/api.Registry/GetBundleForChannel',
    requestStream: false,
    responseStream: false,
    requestType: registry_pb.GetBundleInChannelRequest,
    responseType: registry_pb.Bundle,
    requestSerialize: serialize_api_GetBundleInChannelRequest,
    requestDeserialize: deserialize_api_GetBundleInChannelRequest,
    responseSerialize: serialize_api_Bundle,
    responseDeserialize: deserialize_api_Bundle,
  },
  getChannelEntriesThatReplace: {
    path: '/api.Registry/GetChannelEntriesThatReplace',
    requestStream: false,
    responseStream: true,
    requestType: registry_pb.GetAllReplacementsRequest,
    responseType: registry_pb.ChannelEntry,
    requestSerialize: serialize_api_GetAllReplacementsRequest,
    requestDeserialize: deserialize_api_GetAllReplacementsRequest,
    responseSerialize: serialize_api_ChannelEntry,
    responseDeserialize: deserialize_api_ChannelEntry,
  },
  getBundleThatReplaces: {
    path: '/api.Registry/GetBundleThatReplaces',
    requestStream: false,
    responseStream: false,
    requestType: registry_pb.GetReplacementRequest,
    responseType: registry_pb.Bundle,
    requestSerialize: serialize_api_GetReplacementRequest,
    requestDeserialize: deserialize_api_GetReplacementRequest,
    responseSerialize: serialize_api_Bundle,
    responseDeserialize: deserialize_api_Bundle,
  },
  getChannelEntriesThatProvide: {
    path: '/api.Registry/GetChannelEntriesThatProvide',
    requestStream: false,
    responseStream: true,
    requestType: registry_pb.GetAllProvidersRequest,
    responseType: registry_pb.ChannelEntry,
    requestSerialize: serialize_api_GetAllProvidersRequest,
    requestDeserialize: deserialize_api_GetAllProvidersRequest,
    responseSerialize: serialize_api_ChannelEntry,
    responseDeserialize: deserialize_api_ChannelEntry,
  },
  getLatestChannelEntriesThatProvide: {
    path: '/api.Registry/GetLatestChannelEntriesThatProvide',
    requestStream: false,
    responseStream: true,
    requestType: registry_pb.GetLatestProvidersRequest,
    responseType: registry_pb.ChannelEntry,
    requestSerialize: serialize_api_GetLatestProvidersRequest,
    requestDeserialize: deserialize_api_GetLatestProvidersRequest,
    responseSerialize: serialize_api_ChannelEntry,
    responseDeserialize: deserialize_api_ChannelEntry,
  },
  getDefaultBundleThatProvides: {
    path: '/api.Registry/GetDefaultBundleThatProvides',
    requestStream: false,
    responseStream: false,
    requestType: registry_pb.GetDefaultProviderRequest,
    responseType: registry_pb.Bundle,
    requestSerialize: serialize_api_GetDefaultProviderRequest,
    requestDeserialize: deserialize_api_GetDefaultProviderRequest,
    responseSerialize: serialize_api_Bundle,
    responseDeserialize: deserialize_api_Bundle,
  },
};

exports.RegistryClient = grpc.makeGenericClientConstructor(RegistryService);
