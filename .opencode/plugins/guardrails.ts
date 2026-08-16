import type { Plugin } from "@opencode-ai/plugin";

export const guardrails: Plugin = async () => ({
  "experimental.session.compacting": async (_input, output) => {
    output.context.push(
      "Working-state guardrail: before compacting, preserve the active task, " +
        "files being modified, decisions already locked, and verified-but-unwritten " +
        "findings. Stale tool output may be dropped."
    );
  },
});

export default guardrails;
