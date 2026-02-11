"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react";
import type { TreeNode } from "@/lib/services/vault.service";

interface FolderTreeProps {
  nodes: TreeNode[];
  activePath: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
}

export function FolderTree({ nodes, activePath, onSelectFile, depth = 0 }: FolderTreeProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          activePath={activePath}
          onSelectFile={onSelectFile}
          depth={depth}
        />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  activePath,
  onSelectFile,
  depth,
}: {
  node: TreeNode;
  activePath: string | null;
  onSelectFile: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isActive = activePath === node.path;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-sm hover:bg-muted transition-colors",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-accent" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-accent" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children && (
          <FolderTree
            nodes={node.children}
            activePath={activePath}
            onSelectFile={onSelectFile}
            depth={depth + 1}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-sm transition-colors",
        isActive ? "bg-accent/10 text-accent" : "hover:bg-muted",
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}
