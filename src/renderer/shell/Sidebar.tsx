import {
  Checks,
  ForkKnife,
  type Icon,
  Pulse,
  SlidersHorizontal,
  SquaresFour,
  Wallet,
} from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ModuleId } from "../App";
import { TagChip } from "../tags/TagChip";
import { useTagsStore } from "../tags/tags-store";

interface SidebarProps {
  activeModule: ModuleId;
  onNavigate: (id: ModuleId) => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: Icon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: SquaresFour },
  { id: "habits", label: "Habits", icon: Pulse },
  { id: "planner", label: "Planner", icon: Checks },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "food", label: "Food", icon: ForkKnife },
];

export function Sidebar({
  activeModule,
  onNavigate,
}: SidebarProps): React.JSX.Element {
  const isSettingsActive = activeModule === "settings";
  const tags = useTagsStore((state) => state.tags);
  const selectedTagId = useTagsStore((state) => state.selectedTagId);
  const isLoaded = useTagsStore((state) => state.isLoaded);
  const loadTags = useTagsStore((state) => state.loadTags);
  const selectTag = useTagsStore((state) => state.selectTag);

  useEffect(() => {
    if (!isLoaded) {
      void loadTags();
    }
  }, [isLoaded, loadTags]);

  return (
    <nav className="sidebar-shell" aria-label="Main navigation">
      <div>
        <div className="sidebar-label">modules</div>
        <div className="sidebar-nav" style={{ marginTop: "var(--space-2)" }}>
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                className="nav-button focus-ring"
                onClick={() => onNavigate(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <ItemIcon
                  className="nav-icon"
                  size={18}
                  weight={isActive ? "fill" : "regular"}
                  color={isActive ? "var(--color-accent)" : "currentColor"}
                />
                <span className="nav-copy">
                  <span className="nav-label">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "var(--space-5)" }}>
        <div className="sidebar-label">Tags</div>
        <div className="sidebar-nav" style={{ marginTop: "var(--space-2)" }}>
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              active={activeModule === "tags" && selectedTagId === tag.id}
              onClick={() => {
                void selectTag(tag.id);
                onNavigate("tags");
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div className="sidebar-label">system</div>
        <div className="sidebar-nav" style={{ marginTop: "var(--space-2)" }}>
          <button
            className="nav-button focus-ring"
            onClick={() => onNavigate("settings")}
            title="Settings"
            aria-label="Settings"
            aria-current={isSettingsActive ? "page" : undefined}
          >
            <SlidersHorizontal
              className="nav-icon"
              size={18}
              weight={isSettingsActive ? "fill" : "regular"}
              color={isSettingsActive ? "var(--color-accent)" : "currentColor"}
            />
            <span className="nav-copy">
              <span className="nav-label">Settings</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
