"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/cn";
import { WALLET_COLORS } from "@/lib/constants/wallet-icons";
import type { FinanceCategory } from "@/lib/services/finance.service";

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChanged: () => void;
}

type CategoryTypeFilter = "all" | "income" | "expense";

export function CategoryManagerDialog({
  open,
  onOpenChange,
  onCategoriesChanged,
}: CategoryManagerDialogProps) {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<CategoryTypeFilter>("all");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newColor, setNewColor] = useState(WALLET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editColor, setEditColor] = useState(WALLET_COLORS[0]);
  const [deletingCategory, setDeletingCategory] = useState<FinanceCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/categories");
      if (!res.ok) throw new Error();
      const data: FinanceCategory[] = await res.json();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchCategories();
  }, [open, fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (filter === "all") return categories;
    return categories.filter((category) => category.type === filter);
  }, [categories, filter]);

  function startEdit(category: FinanceCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditType(category.type);
    setEditColor(category.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditType("expense");
    setEditColor(WALLET_COLORS[0]);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          color: newColor,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Category created");
      setNewName("");
      setNewType("expense");
      setNewColor(WALLET_COLORS[0]);
      await fetchCategories();
      onCategoriesChanged();
    } catch {
      toast.error("Failed to create category");
    }
  }

  async function handleSaveEdit(id: number) {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/finance/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          type: editType,
          color: editColor,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Category updated");
      cancelEdit();
      await fetchCategories();
      onCategoriesChanged();
    } catch {
      toast.error("Failed to update category");
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return;
    try {
      const res = await fetch(`/api/finance/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Category deleted");
      setDeletingCategory(null);
      await fetchCategories();
      onCategoriesChanged();
    } catch {
      toast.error("Failed to delete category");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "income", "expense"] as const).map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={filter === item ? "default" : "outline"}
                  onClick={() => setFilter(item)}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </Button>
              ))}
            </div>

            <div className="max-h-[320px] space-y-2 overflow-y-auto rounded-md border p-2">
              {loading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Loading categories...</p>
              ) : filteredCategories.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No categories found</p>
              ) : (
                filteredCategories.map((category) => {
                  const isEditing = editingId === category.id;
                  return (
                    <div
                      key={category.id}
                      className="rounded-md border p-3"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Category name"
                            />
                            <Select
                              value={editType}
                              onValueChange={(value: "income" | "expense") => setEditType(value)}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              {WALLET_COLORS.slice(0, 8).map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setEditColor(color)}
                                  className={cn(
                                    "h-5 w-5 rounded-full border",
                                    editColor === color && "ring-2 ring-offset-2 ring-foreground",
                                  )}
                                  style={{ backgroundColor: color }}
                                  aria-label={`Set category color ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" type="button" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                            <Button size="sm" type="button" onClick={() => void handleSaveEdit(category.id)}>
                              <Check className="h-3.5 w-3.5" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <p className="truncate text-sm font-medium">{category.name}</p>
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {category.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              type="button"
                              onClick={() => startEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit category</span>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              type="button"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete category</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form className="space-y-3 rounded-md border p-3" onSubmit={handleAddCategory}>
              <p className="text-sm font-medium">Add New Category</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Select
                    value={newType}
                    onValueChange={(value: "income" | "expense") => setNewType(value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {WALLET_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={cn(
                      "h-6 w-6 rounded-full border",
                      newColor === color && "ring-2 ring-offset-2 ring-foreground",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Set category color ${color}`}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!newName.trim()}>
                  Add Category
                </Button>
              </div>
            </form>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &quot;{deletingCategory?.name}&quot;. Transactions using this category
              will no longer be categorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDeleteCategory()}
            >
              Delete
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
