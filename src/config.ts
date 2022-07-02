export type PackageJson = {
  name: string;
  displayName: string;
  fullName: string;
  version: string;
};

export type Config = {
  debug?: boolean;
  kill_contracts: {
    enabled: boolean;
  };
  dogtags_collector: {
    enabled: boolean;
  };
};
