import type { DependencyContainer } from "tsyringe";

import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";

import type { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { Config, PackageJson } from "./config";

import { getModDisplayName, isNotUndefined, noop, readJsonFile } from "./utils";

const ROUBLES_ID = "5449016a4bdc2d6f028b456f";
const DOLLARS_ID = "5696686a4bdc2da3298b456a";
const EUROS_ID = "569668774bdc2da2298b4568";
const GP_COIN_ID = "5d235b4d86f7742e017bc88a";
const BEAR_DOGTAG_ID = "59f32bb586f774757e1e8442";
const USEC_DOGTAG_ID = "59f32c3b86f77472a31742f0";

const CUSTOM_QUESTS_MINIMUM_VERSION = "2.4.1";

type Target = "all" | "pmc" | "scav";

const TARGET_TYPES: Record<Target, string> = {
  all: "Any",
  pmc: "AnyPmc",
  scav: "Savage",
};

const getTarget = (target: string): Target | null => {
  if (target === "all" || target === "pmc" || target === "scav") {
    return target;
  }

  return null;
};

const getTargetNameEn = (target: Target): string => {
  if (target === "pmc") {
    return "PMCs";
  } else if (target === "scav") {
    return "Scavs";
  }

  return "Scavs and PMCs";
};

const getTargetNameFr = (target: Target): string => {
  if (target === "pmc") {
    return "PMCs";
  } else if (target === "scav") {
    return "Scavs";
  }

  return "Scavs et les PMCs";
};

const getTargetNameRu = (target: Target): string => {
  if (target === "pmc") {
    return "ЧВКшники";
  } else if (target === "scav") {
    return "Дикие";
  }

  return "Дикие и ЧВКшники";
};

const getKillContractsDescription = (target: Target) => {
  const targetNameEn = getTargetNameEn(target);
  const targetNameFr = getTargetNameFr(target);
  const targetNameRu = getTargetNameRu(target);

  return {
    en: `I need more than a simple Boogey-man.\n${targetNameEn} are everywhere in Tarkov, can you shoot some for me ?`,
    fr: `J'ai besoin de plus qu'un simple croque-mitaine.\nLes ${targetNameFr} sont partout dans Tarkov, peux tu en tuer quelques un pour moi ?`,
    ru: `Привет, наёмник. Есть работёнка для тебя. Видишь ли, в Таркове жопа сейчас, ${targetNameRu} разбрелись по территории города и окрестностей. Мои люди не могут нормально работать, а кое-кто не возвращается вовсе. Подстрели для меня этих ублюдков, и я тебе заплачу.`,
  };
};

const getKillContractsKillMissionMessage = (target: Target, nb: number) => {
  let targetNameEn = "";
  let targetNameFr = "";
  let targetNameRu = "";

  if (target === "pmc") {
    targetNameEn = "PMC";
    targetNameFr = "PMC";
    targetNameRu = "операторов ЧВК";
  } else if (target === "scav") {
    targetNameEn = "Scav";
    targetNameFr = "Scav";
    targetNameRu = "Диких";
  } else {
    targetNameEn = "guy";
    targetNameFr = "gars";
    targetNameRu = "Диких или операторов ЧВК";
  }

  return {
    en: `Shoot ${nb} ${targetNameEn}${nb > 1 ? "s" : ""}`,
    fr: `Tues ${nb} ${targetNameFr}`,
    ru: `Устранить для Скупщика ${nb} ${targetNameRu}`,
  };
};

class Mod implements IPreAkiLoadMod, IPostAkiLoadMod {
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
    const reputationReward = killContracts.trader_reputation_reward;

    const target = getTarget(killContracts.target);

    if (!target) {
      this.logger.error(
        `${this.packageJson.fullName} Error: cannot load kill contracts quest because target is invalid (should be 'any', 'pmc' or 'scav')`
      );
      return undefined;
    }

    return {
      id: "@mod-trap-babayaga/kill_contracts",
      repeatable: true,
      trader_id: killContracts.trader_id,
      name: {
        en: "Baba Yaga: Kill contracts",
        fr: "BaBa Yaga: Contrats de mort",
        ru: "Охотник за головами",
      },
      description: getKillContractsDescription(target),
      success_message: {
        en: "Excellent! Thanks for your help.\nHere is your reward, but wait... there's more.",
        fr: "Excellent ! Merci pour ton aide.\nVoici ta récompense, mais attends... il y en a encore.",
        ru: "Отлично. Может, хоть какое-то время мои ребята спокойно будут зарабатывать на жизнь вместо бесконечных перестрелок с этими уродами. Вот твоя награда!",
      },
      type: "Elimination",
      missions: [
        {
          type: "Kill",
          count: kills,
          target: TARGET_TYPES[target],
          message: getKillContractsKillMissionMessage(target, kills),
        },
      ],
      rewards: {
        xp,
        traders_reputations: {
          [killContracts.trader_id]: reputationReward,
        },
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
    const reputationReward = dogtagsCollector.trader_reputation_reward;

    const gpCoins = dogtagsCollector.gp_coins_reward;

    const missionMessageEn = `Give me ${dogtags} dogtag${
      dogtags > 1 ? "s" : ""
    }`;

    const missionMessageFr = `Donnes moi ${dogtags} dogtag${
      dogtags > 1 ? "s" : ""
    }`;

    const missionMessageRu = `Принести Скупщику ${dogtags} жетонов убитых операторов ЧВК`;

    return {
      id: "@mod-trap-babayaga/dogtags_collector",
      repeatable: true,
      trader_id: dogtagsCollector.trader_id,
      name: {
        en: "Baba Yaga: Dogtags collector",
        fr: "Baba Yaga: Collectioneur de dogtags",
        ru: "Доказательства",
      },
      description: {
        en: "Give me the name of those you eliminate and I'll give you some extra rewards.",
        fr: "Donnes moi le nom de ceux que tu as éliminé et je te donnerai des récompenses supplémentaires.",
        ru: "По поводу моего поручения тебе. У меня тесные торговые взаимоотношения с Прапором и Миротворцем. Думаю, они смогли бы сообщить кому надо о гибели их соотечественников, так что... Когда убиваешь оператора, снимай с него жетон. За каждый такой плачу тебе отдельно.",
      },
      success_message: {
        en: "Excellent! Thanks for your help.\n Here is your reward, but wait... there is more.",
        fr: "Excellent ! Merci pour ton aide.\nVoici ta récompense, mais attends... il y en a encore.",
        ru: "Хорошо, спасибо. Нехило ты опытных вояк уделал, верно? Вот, держи. Плачу дополнительно, как обещал.",
      },
      type: "PickUp",
      missions: [
        {
          type: "GiveItem",
          accepted_items: [USEC_DOGTAG_ID, BEAR_DOGTAG_ID],
          count: dogtags,
          message: {
            en: missionMessageEn,
            fr: missionMessageFr,
            ru: missionMessageRu,
          },
        },
      ],
      rewards: {
        xp,
        traders_reputations: {
          [dogtagsCollector.trader_id]: reputationReward,
        },
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

  public preAkiLoad(container: DependencyContainer): void {
    this.logger = container.resolve<ILogger>("WinstonLogger");
    this.packageJson = readJsonFile<PackageJson>("../package.json");
    this.config = readJsonFile<Config>("../config/config.json");

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

  public postAkiLoad(): void {
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
