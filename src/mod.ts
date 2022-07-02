import type { DependencyContainer } from "tsyringe";

import type { IMod } from "@spt-aki/models/external/mod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { getModDisplayName, noop, readJsonFile } from "./utils";
import type { Config, PackageJson } from "./config";

class Mod implements IMod {
  private logger: ILogger;
  private debug: (data: string) => void;
  private packageJson: PackageJson;
  private config: Config;

  public load(container: DependencyContainer): void {
    this.logger = container.resolve<ILogger>("WinstonLogger");
    this.packageJson = readJsonFile<PackageJson>("../package.json");
    this.config = readJsonFile<Config>("./config/config.json");

    console.log(this.packageJson, this.config);

    this.debug = this.config.debug
      ? (data: string) =>
          this.logger.debug(`${this.packageJson.displayName}: ${data}`, true)
      : noop;

    if (this.config.debug) {
      this.debug("debug mode enabled");
    }

    this.logger.info(
      `===> Loading ${getModDisplayName(this.packageJson, true)}`
    );
  }

  public delayedLoad(container: DependencyContainer): void {
    void container;
    // const database = container.resolve<DatabaseServer>("DatabaseServer");
    // const configServer = container.resolve<ConfigServer>("ConfigServer");
    // const modLoader = container.resolve<InitialModLoader>("InitialModLoader");

    this.logger.success(
      `===> Successfully loaded ${getModDisplayName(this.packageJson, true)}`
    );
  }
}

module.exports = { mod: new Mod() };
