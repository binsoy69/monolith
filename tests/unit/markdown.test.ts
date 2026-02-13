import { describe, it, expect } from "vitest";
import * as markdownUtils from "@/lib/utils/markdown";

describe("Markdown Utils", () => {
  describe("parseMarkdownTasks", () => {
    it("should return empty list for empty content", () => {
      const tasks = markdownUtils.parseMarkdownTasks("");
      expect(tasks).toEqual([]);
    });

    it("should parse simple checklist", () => {
      const content = `
- [ ] Task 1
- [x] Task 2
            `;
      const tasks = markdownUtils.parseMarkdownTasks(content);
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toEqual({
        title: "Task 1",
        isCompleted: false,
        children: [],
      });
      expect(tasks[1]).toEqual({
        title: "Task 2",
        isCompleted: true,
        children: [],
      });
    });

    it("should handle indentation for nesting", () => {
      const content = `
- [ ] Parent
  - [ ] Child 1
    - [x] Grandchild
  - [ ] Child 2
- [ ] Uncle
            `;
      const tasks = markdownUtils.parseMarkdownTasks(content);
      expect(tasks).toHaveLength(2); // Parent, Uncle

      const parent = tasks[0];
      expect(parent.title).toBe("Parent");
      expect(parent.children).toHaveLength(2);

      const child1 = parent.children[0];
      expect(child1.title).toBe("Child 1");
      expect(child1.children).toHaveLength(1);
      expect(child1.children[0].title).toBe("Grandchild");
      expect(child1.children[0].isCompleted).toBe(true);

      expect(tasks[1].title).toBe("Uncle");
    });

    it("should ignore non-task lines", () => {
      const content = `
# Heading
- Bullet point
- [ ] Real task
Text paragraph
             `;
      const tasks = markdownUtils.parseMarkdownTasks(content);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Real task");
    });
  });
});
