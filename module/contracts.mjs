/**
 * WITCH & WARD — Cross-package contracts.
 * Constants only: no imports, no Foundry globals, no logic. Every name that two
 * parts of the system must agree on (setting keys, chat-card kinds, GM operation
 * names, hook names, flag scopes) is declared here once and imported everywhere,
 * so packages built in parallel cannot drift apart; a test asserts each one is
 * actually used. Change it only on purpose, together with every user of it.
 */
export const SYSTEM_ID = "witch-ward";
/** Flag scope for documents (flags["witch-ward"]). */
export const FLAG = "witch-ward";
/** CONFIG.queries handler name for GM-authoritative operations. */
export const QUERY = "witch-ward.op";
/** Socket channel (system.json "socket": true). */
export const SOCKET = "system.witch-ward";

/** World/client setting keys. */
export const SETTINGS = Object.freeze({});
/** Chat-card kinds. */
export const CARD = Object.freeze({});
/** GM-authoritative operation names. */
export const OPS = Object.freeze({});
/** Hooks this system fires (other modules may listen). */
export const HOOKS = Object.freeze({});
