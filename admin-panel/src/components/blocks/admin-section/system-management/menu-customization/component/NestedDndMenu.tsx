import {
  SimpleTreeItemWrapper,
  SortableTree,
  TreeItemComponentProps,
} from "dnd-kit-sortable-tree";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui";
import TableEditIcon from "@/assets/icons/TableEditIcon";

interface NestedDndMenuProps {
  itemsList: any[];
  onItemsChange?: (items: any[]) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
  language?: string;
}

export default function NestedDndMenu({
  itemsList,
  onItemsChange,
  onLabelChange,
  language = "df",
}: NestedDndMenuProps) {
  const [items, setItems] = useState(itemsList);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setItems((prev) => {
      const isSame = JSON.stringify(prev) === JSON.stringify(itemsList);
      return isSame ? prev : itemsList;
    });
  }, [itemsList]);

  const handleItemsChange = (newItems: any[]) => {
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  const handleDeleteItem = (id: string) => {
    const deleteItem = (items: any[]): any[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? deleteItem(item.children) : undefined,
        }));
    };

    const newItems = deleteItem(items);
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  return (
    <SortableTree
      items={items}
      onItemsChanged={handleItemsChange}
      TreeItemComponent={(props) => (
        <TreeItem
          {...props}
          item={props.item}
          isEditing={editingId === props.item.id}
          onStartEditing={(id) => setEditingId(id)}
          onStopEditing={() => setEditingId(null)}
          onSaveLabel={onLabelChange}
          onDelete={handleDeleteItem}
        />
      )}
    />
  );
}

type MinimalTreeItemData = {
  label: string;
  id: string;
};

interface TreeItemProps extends TreeItemComponentProps<MinimalTreeItemData> {
  onDelete: (id: string) => void;
  onSaveLabel?: (id: string, newLabel: string) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
  isEditing: boolean;
  item: any;
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      item,
      onDelete,
      onSaveLabel,
      onStartEditing,
      onStopEditing,
      isEditing,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(item.label);

    useEffect(() => {
      if (isEditing) {
        setLocalValue(item.label);
      }
    }, [isEditing, item.label]);

    const handleSave = () => {
      if (onSaveLabel && localValue.trim() !== "") {
        onSaveLabel(item.id, localValue.trim());
      }
      onStopEditing();
    };

    return (
      <SimpleTreeItemWrapper {...props} ref={ref} item={item}>
        <div className="flex items-center justify-between w-full">
          {isEditing ? (
            <div className="mx-4 w-full">
              <Input
                value={localValue}
                autoFocus
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") onStopEditing();
                }}
                onBlur={handleSave}
                className="app-input rounded h-8 w-full"
              />
            </div>
          ) : (
            <span>{item.label}</span>
          )}

          <div className="flex gap-1">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded bg-slate-50 border border-slate-500 text-slate-500 hover:bg-slate-500 hover:text-white cursor-pointer p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEditing(item.id);
                }}
              >
                <TableEditIcon />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded bg-blue-50 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer p-1"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 rounded bg-red-50 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer p-1"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SimpleTreeItemWrapper>
    );
  }
);
TreeItem.displayName = "TreeItem";
