/**
 * Markdown checklist parser — extracts tasks from markdown content.
 * Supports nested subtasks via indentation.
 */

export interface ParsedTask {
  title: string;
  isCompleted: boolean;
  children: ParsedTask[];
}

/**
 * Parse markdown content and extract checklist items.
 * Recognizes `- [ ] task` and `- [x] task` patterns.
 * Nesting is determined by indentation level (2 or 4 spaces, or tabs).
 */
export function parseMarkdownTasks(content: string): ParsedTask[] {
  const lines = content.split(/\r?\n/);
  const root: ParsedTask[] = [];
  // Stack of { indent, task } to track nesting
  const stack: { indent: number; task: ParsedTask }[] = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (!match) continue;

    const indent = match[1].replace(/\t/g, "    ").length;
    const isCompleted = match[2].toLowerCase() === "x";
    const title = match[3].trim();

    const task: ParsedTask = { title, isCompleted, children: [] };

    // Pop stack until we find a parent with smaller indent
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(task);
    } else {
      stack[stack.length - 1].task.children.push(task);
    }

    stack.push({ indent, task });
  }

  return root;
}
