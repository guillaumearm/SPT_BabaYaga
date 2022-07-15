export type PackageJson = {
  name: string;
  displayName: string;
  fullName: string;
  version: string;
};

type CommonQuestProperties = {
  enabled: boolean;
  trader_id: string;
  needed_dogtags: number;
  gp_coins_reward: number;
  trader_reputation_reward: number;
};

export type Config = {
  debug?: boolean;

  quests: {
    kill_contracts: CommonQuestProperties & {
      target: string; // 'all' | 'pmc' | 'scav'
      needed_kills: number;
      experience_per_kill: number;
      roubles_per_kill: number;
      dollars_per_kill: number;
      euros_per_kill: number;
    };
    dogtags_collector: CommonQuestProperties & {
      needed_dogtags: number;
      experience_per_dogtag: number;
      roubles_per_dogtag: number;
      dollars_per_dogtag: number;
      euros_per_dogtag: number;
    };
  };
};
