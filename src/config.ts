export type PackageJson = {
  name: string;
  displayName: string;
  fullName: string;
  version: string;
};

export type Config = {
  debug?: boolean;

  quests: {
    kill_contracts: {
      enabled: boolean;
      trader_id: string;
      target: string; // 'all' | 'pmc' | 'scav'
      needed_kills: number;
      experience_per_kill: number;
      roubles_per_kill: number;
      dollars_per_kill: number;
      euros_per_kill: number;
      gp_coins_reward: number;
    };
    dogtags_collector: {
      enabled: boolean;
      trader_id: string;
      needed_dogtags: number;
      experience_per_dogtag: number;
      roubles_per_dogtag: number;
      dollars_per_dogtag: number;
      euros_per_dogtag: number;
      gp_coins_reward: number;
    };
  };
};
