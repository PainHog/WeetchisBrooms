/**
 * WITCH & WARD — the running episode (a world setting written only by a GM).
 */
import { SYSTEM_ID, SETTINGS } from "./contracts.mjs";

export function getEpisode() {
  return game.settings.get(SYSTEM_ID, SETTINGS.episode) ?? { active: false };
}

export async function setEpisode(state) {
  if (!game.user?.isGM) throw new Error("Only a GM can change the episode.");
  await game.settings.set(SYSTEM_ID, SETTINGS.episode, state); // its onChange fires HOOKS.episodeChanged on every client
  return state;
}

/** The actors in the running episode's coven (witches and the guardian). */
export function covenActors(state = getEpisode()) {
  return (state.coven ?? []).map(id => game.actors.get(id)).filter(Boolean);
}

/** [{id, name, hurt, down, guardian}] for the threat's targeting. */
export function covenStatus(state = getEpisode()) {
  return covenActors(state).map(a => ({ id: a.id, name: a.name, hurt: a.system.hurt ?? 0, down: !!a.system.down, guardian: a.type === "guardian" }));
}

export const witchesStanding = (state = getEpisode()) => covenActors(state).filter(a => a.type === "witch" && !a.system.down).length;

/** The first active GM: the one client that applies automation. */
export function isActiveGM() {
  const gm = game.users.activeGM ?? game.users.find(u => u.isGM && u.active);
  return !!gm && gm.id === game.user?.id;
}
