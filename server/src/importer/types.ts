import { Operator } from "./normalizer/types";
import { Package } from "../../proto/registry_pb";
import { GenericOperatorChannel, GenericOperatorPackage } from "../sharedTypes";


export enum LogLevel {
    debug,
    log,
    warn,
    error
}

export type ClientTransportError = {
    name: string,
    endpoint: string,
    data: any
}

export type OperatorChannel = GenericOperatorChannel<Operator>;

export type OperatorPackage = GenericOperatorPackage<Operator>;

export type OperatorsMap = Map<string, Operator>;
export type RawPackages = Set<Package.AsObject>;
export type Packages = Set<OperatorPackage>;
