// Feature Flags configuration
export const isBattleReady =
  process.env.NEXT_PUBLIC_IS_READY_BATTLE === "true" ||
  process.env.NEXT_PUBLIC_IS_BATTLE_READY === "true";

export default {
  isBattleReady,
};
