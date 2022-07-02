import type { DependencyContainer } from "tsyringe";

import type { IMod } from "@spt-aki/models/external/mod";
import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { getModDisplayName, isNotUndefined, noop, readJsonFile } from "./utils";
import type { Config, PackageJson } from "./config";

const ROUBLES_ID = "5449016a4bdc2d6f028b456f";
const DOLLARS_ID = "5696686a4bdc2da3298b456a";
const EUROS_ID = "569668774bdc2da2298b4568";
const GP_COIN_ID = "5d235b4d86f7742e017bc88a";
const BEAR_DOGTAG_ID = "59f32bb586f774757e1e8442";
const USEC_DOGTAG_ID = "59f32c3b86f77472a31742f0";

const CUSTOM_QUESTS_MINIMUM_VERSION = "2.3.1";

class Mod implements IMod {
  private logger: ILogger;
  private debug: (data: string) => void;

  private modName: string;
  private packageJson: PackageJson;
  private config: Config;

  private getKillContracts() {
    const killContracts = this.config.quests.kill_contracts;

    if (!killContracts.enabled) {
      return undefined;
    }

    const kills = killContracts.needed_kills || 1;

    const xp = killContracts.experience_per_kill * kills;
    const roubles = killContracts.roubles_per_kill * kills;
    const dollars = killContracts.dollars_per_kill * kills;
    const euros = killContracts.euros_per_kill * kills;
    const gpCoins = killContracts.gp_coins_reward;

    return {
      id: "@mod-trap-babayaga/kill_contracts",
      repeatable: true,
      trader_id: killContracts.trader_id,
      name: {
        en: "Baba Yaga: Kill contracts",
      },
      description: {
        en: "I need more than a simple Boogey-man.\nScavs and PMCs are everywhere, can you kill a bunch of them in Tarkov for me ?",
      },
      success_message: {
        en: "Excellent! Thanks for your help.\n Here is your reward, but wait... there is more.",
      },
      type: "Elimination",
      missions: [
        {
          type: "Kill",
          count: kills,
          target: "Any",
          message: {
            en: `Kill ${kills} guy${kills > 1 ? "s" : ""}`,
          },
        },
      ],
      rewards: {
        xp,
        items: {
          [ROUBLES_ID]: roubles,
          [DOLLARS_ID]: dollars,
          [EUROS_ID]: euros,
          [GP_COIN_ID]: gpCoins,
        },
      },
    };
  }

  private getDogtagsCollectorQuest() {
    const dogtagsCollector = this.config.quests.dogtags_collector;

    if (!dogtagsCollector.enabled) {
      return undefined;
    }

    const dogtags = dogtagsCollector.needed_dogtags || 1;

    const xp = dogtagsCollector.experience_per_dogtag * dogtags;
    const roubles = dogtagsCollector.roubles_per_dogtag * dogtags;
    const dollars = dogtagsCollector.dollars_per_dogtag * dogtags;
    const euros = dogtagsCollector.euros_per_dogtag * dogtags;

    const gpCoins = dogtagsCollector.gp_coins_reward;

    return {
      id: "@mod-trap-babayaga/dogtags_collector",
      repeatable: true,
      trader_id: dogtagsCollector.trader_id,
      name: {
        en: "Baba Yaga: Dogtags collector",
      },
      description: {
        en: "Give me the name of those you eliminate and I give you some extra rewards.",
      },
      success_message: {
        en: "Excellent! Thanks for your help.\n Here is your reward, but wait... there is more.",
      },
      type: "PickUp",
      missions: [
        {
          type: "GiveItem",
          accepted_items: [USEC_DOGTAG_ID, BEAR_DOGTAG_ID],
          count: dogtags,
          message: {
            en: `Give me ${dogtags} dogtag${dogtags > 1 ? "s" : ""}`,
          },
        },
      ],
      rewards: {
        xp,
        items: {
          [ROUBLES_ID]: roubles,
          [DOLLARS_ID]: dollars,
          [EUROS_ID]: euros,
          [GP_COIN_ID]: gpCoins,
        },
      },
    };
  }

  private getCustomQuests() {
    return [this.getKillContracts(), this.getDogtagsCollectorQuest()].filter(
      isNotUndefined
    );
  }

  public load(container: DependencyContainer): void {
    this.logger = container.resolve<ILogger>("WinstonLogger");
    this.packageJson = readJsonFile<PackageJson>("../package.json");
    this.config = readJsonFile<Config>("./config/config.json");

    this.modName = getModDisplayName(this.packageJson);

    this.debug = this.config.debug
      ? (data: string) =>
          this.logger.debug(`${this.packageJson.displayName}: ${data}`, true)
      : noop;

    if (this.config.debug) {
      this.debug("debug mode enabled");
    }

    this.logger.info(`===> Loading ${this.modName}`);
  }

  public delayedLoad(): void {
    if (!globalThis.CustomQuestsAPI) {
      this.logger.error(
        `${this.packageJson.fullName} Error: CustomQuestsAPI not found, are you sure a version of CustomQuests >= ${CUSTOM_QUESTS_MINIMUM_VERSION} is installed ?`
      );
      return;
    }

    // TODO: api types
    const api = globalThis.CustomQuestsAPI;

    if (!api.load) {
      this.logger.error(
        `${this.packageJson.fullName} Fatal Error: CustomQuestsAPI.load method not found`
      );
      return;
    }

    const quests = this.getCustomQuests();

    if (!quests.length) {
      this.logger.warning(`${this.packageJson.fullName}: all quests disabled`);
      return;
    }

    api.load(quests);

    quests.forEach((q) => {
      this.debug(`loaded '${q.name.en}' quest!`);
    });

    this.logger.success(`===> Successfully loaded ${this.modName}`);
  }
}

module.exports = { mod: new Mod() };
