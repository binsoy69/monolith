import { create } from "zustand";
import type {
  Tag,
  TaggedItemSummary,
  TaggableItemType,
} from "../../shared/domain-types";
import { addToast } from "../shared/toast-store";

interface TagsStore {
  tags: Tag[];
  selectedTagId: string | null;
  items: TaggedItemSummary[];
  isLoaded: boolean;
  loadTags: () => Promise<void>;
  selectTag: (tagId: string) => Promise<void>;
  createTag: (name: string) => Promise<Tag | null>;
  ensureItemTags: (
    itemType: TaggableItemType,
    itemId: string,
  ) => Promise<Tag[]>;
  setTagAssignment: (
    itemType: TaggableItemType,
    itemId: string,
    tagId: string,
    assigned: boolean,
  ) => Promise<void>;
}

interface TagsStoreState extends TagsStore {
  assignmentCache: Record<string, Tag[]>;
}

function sortTags(tags: Tag[]): Tag[] {
  return [...tags].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
  );
}

function getItemKey(itemType: TaggableItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}

export const useTagsStore = create<TagsStoreState>((set, get) => ({
  tags: [],
  selectedTagId: null,
  items: [],
  isLoaded: false,
  assignmentCache: {},

  loadTags: async () => {
    try {
      const tags = await window.api.tags.list();
      set((state) => {
        const selectedTagStillExists = state.selectedTagId
          ? tags.some((tag) => tag.id === state.selectedTagId)
          : true;

        return {
          tags: sortTags(tags),
          isLoaded: true,
          selectedTagId: selectedTagStillExists ? state.selectedTagId : null,
          items: selectedTagStillExists ? state.items : [],
        };
      });
    } catch {
      addToast({ type: "error", message: "Failed to load tags." });
    }
  },

  selectTag: async (tagId) => {
    set({ selectedTagId: tagId });

    try {
      const items = await window.api.tags.getItemsByTag(tagId);
      set({ items });
    } catch {
      addToast({ type: "error", message: "Failed to load tagged items." });
    }
  },

  createTag: async (name) => {
    try {
      const tag = await window.api.tags.create({ name });
      set((state) => ({
        tags: sortTags([...state.tags, tag]),
        isLoaded: true,
      }));
      return tag;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create tag.";
      addToast({ type: "error", message });
      return null;
    }
  },

  ensureItemTags: async (itemType, itemId) => {
    if (!get().isLoaded) {
      await get().loadTags();
    }

    const key = getItemKey(itemType, itemId);
    const cached = get().assignmentCache[key];
    if (cached) {
      return cached;
    }

    try {
      const assignedTags = await window.api.tags.listForItem({ itemType, itemId });
      const sorted = sortTags(assignedTags);
      set((state) => ({
        assignmentCache: {
          ...state.assignmentCache,
          [key]: sorted,
        },
      }));
      return sorted;
    } catch {
      addToast({ type: "error", message: "Failed to load tag assignments." });
      return [];
    }
  },

  setTagAssignment: async (itemType, itemId, tagId, assigned) => {
    const key = getItemKey(itemType, itemId);
    const current =
      get().assignmentCache[key] ?? (await get().ensureItemTags(itemType, itemId));

    try {
      await window.api.tags.setAssignment({ tagId, itemType, itemId, assigned });

      const tag = get().tags.find((entry) => entry.id === tagId);
      const nextAssignments = assigned
        ? tag && !current.some((entry) => entry.id === tagId)
          ? sortTags([...current, tag])
          : current
        : current.filter((entry) => entry.id !== tagId);

      set((state) => ({
        assignmentCache: {
          ...state.assignmentCache,
          [key]: nextAssignments,
        },
      }));

      if (get().selectedTagId === tagId) {
        const items = await window.api.tags.getItemsByTag(tagId);
        set({ items });
      }
    } catch {
      addToast({ type: "error", message: "Failed to update tag assignment." });
    }
  },
}));
