import { readFileSync } from "fs";
import path from "path";

import type { PackageJson } from "./config";

export const readJsonFile = <T>(filePath: string): T => {
  return JSON.parse(readFileSync(path.join(__dirname, filePath), "utf-8"));
};

export const getModDisplayName = (packageJson: PackageJson): string => {
  return `${packageJson.displayName} v${packageJson.version}`;
};

export function noop(): void {}

export function isNotUndefined<T>(x: T | undefined): x is T {
  if (x === undefined) {
    return false;
  }

  return true;
}
