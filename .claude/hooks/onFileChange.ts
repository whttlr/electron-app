import { HookContext } from "@anthropic-ai/claude-code/hook";

export async function onFileChange(context: HookContext) {
  const changed = context.files.getChanged();

  for (const file of changed) {
    if (file.path.endsWith(".ts") || file.path.endsWith(".js") || file.path.endsWith(".tsx") ) {
      const testFile = `tests/${file.path
        .replace(/^src\//, "")
        .replace(/\.(ts|js)$/, ".test.ts")}`;

      const result = await context.runCommand(`npx vitest run ${testFile}`);

      if (result.exitCode \!== 0) {
        await context.insertSystemMessage(
          `❌ Test failed for \`${file.path}\`. Please fix the code before continuing.

**Test Output:**
\`\`\`
${result.stdout}
\`\`\``
        );
        return; // Prevent continuing until fixed
      }
    }
  }
}
