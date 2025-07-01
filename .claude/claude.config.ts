import { ClaudeConfig } from "@anthropic-ai/claude-code";

const config: ClaudeConfig = {
  name: "Claude TDD Enforcer",
  description: "Runs tests after each file change and blocks forward progress until they pass.",
  hooks: {
    onFileChange: "./hooks/onFileChange.ts"
  },
};

export default config;
