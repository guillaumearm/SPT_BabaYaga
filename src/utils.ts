import { readFileSync } from "fs";
import path from "path";

import type { PackageJson } from "./config";

export const readJsonFile = <T>(filePath: string): T => {
  return JSON.parse(readFileSync(path.join(__dirname, filePath), "utf-8"));
};

export const getModDisplayName = (
  packageJson: PackageJson,
  withVersion = false
): string => {
  if (withVersion) {
    return `${packageJson.displayName} v${packageJson.version}`;
  }
  return `${packageJson.displayName}`;
};

export function noop(): void {}
