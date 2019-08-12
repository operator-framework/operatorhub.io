// package: api
// file: registry.proto

var registry_pb = require("./registry_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Registry = (function () {
  function Registry() {}
  Registry.serviceName = "api.Registry";
  return Registry;
}());

Registry.ListPackages = {
  methodName: "ListPackages",
  service: Registry,
  requestStream: false,
  responseStream: true,
  requestType: registry_pb.ListPackageRequest,
  responseType: registry_pb.PackageName
};

Registry.GetPackage = {
  methodName: "GetPackage",
  service: Registry,
  requestStream: false,
  responseStream: false,
  requestType: registry_pb.GetPackageRequest,
  responseType: registry_pb.Package
};

Registry.GetBundle = {
  methodName: "GetBundle",
  service: Registry,
  requestStream: false,
  responseStream: false,
  requestType: registry_pb.GetBundleRequest,
  responseType: registry_pb.Bundle
};

Registry.GetBundleForChannel = {
  methodName: "GetBundleForChannel",
  service: Registry,
  requestStream: false,
  responseStream: false,
  requestType: registry_pb.GetBundleInChannelRequest,
  responseType: registry_pb.Bundle
};

Registry.GetChannelEntriesThatReplace = {
  methodName: "GetChannelEntriesThatReplace",
  service: Registry,
  requestStream: false,
  responseStream: true,
  requestType: registry_pb.GetAllReplacementsRequest,
  responseType: registry_pb.ChannelEntry
};

Registry.GetBundleThatReplaces = {
  methodName: "GetBundleThatReplaces",
  service: Registry,
  requestStream: false,
  responseStream: false,
  requestType: registry_pb.GetReplacementRequest,
  responseType: registry_pb.Bundle
};

Registry.GetChannelEntriesThatProvide = {
  methodName: "GetChannelEntriesThatProvide",
  service: Registry,
  requestStream: false,
  responseStream: true,
  requestType: registry_pb.GetAllProvidersRequest,
  responseType: registry_pb.ChannelEntry
};

Registry.GetLatestChannelEntriesThatProvide = {
  methodName: "GetLatestChannelEntriesThatProvide",
  service: Registry,
  requestStream: false,
  responseStream: true,
  requestType: registry_pb.GetLatestProvidersRequest,
  responseType: registry_pb.ChannelEntry
};

Registry.GetDefaultBundleThatProvides = {
  methodName: "GetDefaultBundleThatProvides",
  service: Registry,
  requestStream: false,
  responseStream: false,
  requestType: registry_pb.GetDefaultProviderRequest,
  responseType: registry_pb.Bundle
};

exports.Registry = Registry;

function RegistryClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

RegistryClient.prototype.listPackages = function listPackages(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Registry.ListPackages, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getPackage = function getPackage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Registry.GetPackage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getBundle = function getBundle(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Registry.GetBundle, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getBundleForChannel = function getBundleForChannel(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Registry.GetBundleForChannel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getChannelEntriesThatReplace = function getChannelEntriesThatReplace(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Registry.GetChannelEntriesThatReplace, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getBundleThatReplaces = function getBundleThatReplaces(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Registry.GetBundleThatReplaces, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getChannelEntriesThatProvide = function getChannelEntriesThatProvide(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Registry.GetChannelEntriesThatProvide, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getLatestChannelEntriesThatProvide = function getLatestChannelEntriesThatProvide(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Registry.GetLatestChannelEntriesThatProvide, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

RegistryClient.prototype.getDefaultBundleThatProvides = function getDefaultBundleThatProvides(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Registry.GetDefaultBundleThatProvides, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.RegistryClient = RegistryClient;

