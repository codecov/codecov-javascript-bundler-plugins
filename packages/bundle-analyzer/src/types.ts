export interface PackageJson {
  name?: string;
  version?: string;
  main?: string;
  module?: string;
  exports?: Exports;
}

export type Exports = string | string[] | PackageExportsEntryObject;

interface PackageExportsEntryObject {
  [key: string]: string | string[] | PackageExportsEntryObject | undefined;
  require?: string;
  import?: string;
  node?: string;
  default?: string;
  types?: string;
}
