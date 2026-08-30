export interface StateMachine<S extends string> {
  initial: S;
  canTransition(from: S, to: S): boolean;
  assertTransition(from: S, to: S): void;
  getAllowedTransitions(from: S): S[];
}

export function defineStateMachine<S extends string>(config: {
  initial: S;
  transitions: { from: S; to: S }[];
}): StateMachine<S> {
  const allowed = new Map<S, Set<S>>();

  for (const { from, to } of config.transitions) {
    const set = allowed.get(from) ?? new Set<S>();
    set.add(to);
    allowed.set(from, set);
  }

  return {
    initial: config.initial,
    canTransition(from, to) {
      return allowed.get(from)?.has(to) ?? false;
    },
    assertTransition(from, to) {
      if (!this.canTransition(from, to)) {
        throw new Error(
          `Invalid state transition from ${from} to ${to}. Allowed transitions from ${from}: ${Array.from(allowed.get(from) ?? []).join(", ")}`,
        );
      }
    },
    getAllowedTransitions(from) {
      return Array.from(allowed.get(from) ?? []);
    },
  };
}
