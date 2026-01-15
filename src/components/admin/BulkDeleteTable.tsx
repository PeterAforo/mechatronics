"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

interface BulkDeleteTableProps<T extends { id: string }> {
  items: T[];
  deleteEndpoint: string;
  itemName: string;
  itemNamePlural: string;
  renderItem: (item: T, isSelected: boolean, onToggle: () => void) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export default function BulkDeleteTable<T extends { id: string }>({
  items,
  deleteEndpoint,
  itemName,
  itemNamePlural,
  renderItem,
  emptyState,
}: BulkDeleteTableProps<T>) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setDeleting(true);
    try {
      const res = await fetch(deleteEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${itemNamePlural}`);
      }

      toast.success(`${data.deleted || selectedIds.size} ${selectedIds.size === 1 ? itemName : itemNamePlural} deleted`);
      setSelectedIds(new Set());
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to delete ${itemNamePlural}`);
    } finally {
      setDeleting(false);
    }
  };

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-purple-700 font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? itemName : itemNamePlural} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table with Checkboxes */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Header with Select All */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all"
            className={someSelected ? "data-[state=checked]:bg-purple-600" : ""}
          />
          <span className="text-sm text-gray-600">
            {allSelected ? "Deselect all" : "Select all"}
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id}>
              {renderItem(item, selectedIds.has(item.id), () => toggleItem(item.id))}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} {selectedIds.size === 1 ? itemName : itemNamePlural}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {selectedIds.size === 1 ? itemName : itemNamePlural}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete {selectedIds.size} {selectedIds.size === 1 ? itemName : itemNamePlural}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
