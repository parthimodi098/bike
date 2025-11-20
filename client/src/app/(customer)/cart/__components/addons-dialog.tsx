"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon, MinusIcon, Trash2Icon, PackagePlusIcon } from "lucide-react";
import { AVAILABLE_ADDONS, SelectedAddon } from "@/data/addons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddonsDialogProps {
  selectedAddons: SelectedAddon[];
  onAddonsChange: (addons: SelectedAddon[]) => void;
}

export function AddonsDialog({
  selectedAddons,
  onAddonsChange,
}: AddonsDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentAddon, setCurrentAddon] = useState<{
    category: string;
    description: string;
    size: string;
    quantity: number;
  }>({
    category: "",
    description: "",
    size: "",
    quantity: 1,
  });

  const handleAddAddon = () => {
    if (!currentAddon.category || !currentAddon.size) {
      return;
    }

    const newAddon: SelectedAddon = {
      category: currentAddon.category,
      description: currentAddon.description,
      size: currentAddon.size,
      quantity: currentAddon.quantity,
    };

    onAddonsChange([...selectedAddons, newAddon]);

    // Reset form
    setCurrentAddon({
      category: "",
      description: "",
      size: "",
      quantity: 1,
    });
  };

  const handleRemoveAddon = (index: number) => {
    const updatedAddons = selectedAddons.filter((_, i) => i !== index);
    onAddonsChange(updatedAddons);
  };

  const handleQuantityChange = (index: number, change: number) => {
    const updatedAddons = [...selectedAddons];
    const newQuantity = Math.max(1, updatedAddons[index].quantity + change);
    updatedAddons[index].quantity = newQuantity;
    onAddonsChange(updatedAddons);
  };

  const selectedCategory = AVAILABLE_ADDONS.find(
    (addon) =>
      addon.category === currentAddon.category &&
      addon.description === currentAddon.description
  );

  const uniqueCategories = Array.from(
    new Set(AVAILABLE_ADDONS.map((addon) => addon.category))
  );

  const descriptionsForCategory = AVAILABLE_ADDONS.filter(
    (addon) => addon.category === currentAddon.category
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full border-yellow-primary text-yellow-primary hover:bg-yellow-50"
        >
          <PackagePlusIcon className="w-4 h-4 mr-2" />
          Add Riding Gear & Accessories {selectedAddons.length > 0 && `(${selectedAddons.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Riding Gear & Accessories</DialogTitle>
          <DialogDescription>
            Choose the gear and accessories you need for your ride.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Addons List */}
          {selectedAddons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Selected Items:</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedAddons.map((addon, index) => (
                  <Card key={index} className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{addon.category}</span>
                          {addon.description && (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              - {addon.description}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs text-gray-800 dark:text-gray-200">
                            Size: {addon.size}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(index, -1)}
                        >
                          <MinusIcon className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {addon.quantity}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(index, 1)}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveAddon(index)}
                        >
                          <Trash2Icon className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add New Addon Form */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-semibold">Add New Item:</Label>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={currentAddon.category}
                onValueChange={(value) => {
                  setCurrentAddon({
                    category: value,
                    description: "",
                    size: "",
                    quantity: 1,
                  });
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description Selection */}
            {currentAddon.category && descriptionsForCategory.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="description">Type</Label>
                <Select
                  value={currentAddon.description}
                  onValueChange={(value) => {
                    setCurrentAddon({
                      ...currentAddon,
                      description: value,
                      size: "",
                    });
                  }}
                >
                  <SelectTrigger id="description">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {descriptionsForCategory.map((addon, idx) => (
                      <SelectItem key={idx} value={addon.description}>
                        {addon.description || "Standard"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size Selection */}
            {currentAddon.category &&
              (descriptionsForCategory.length === 1 ||
                currentAddon.description) && (
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select
                    value={currentAddon.size}
                    onValueChange={(value) => {
                      setCurrentAddon({
                        ...currentAddon,
                        size: value,
                      });
                    }}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedCategory?.sizeOptions || []).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setCurrentAddon({
                      ...currentAddon,
                      quantity: Math.max(1, currentAddon.quantity - 1),
                    })
                  }
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentAddon.quantity}
                  onChange={(e) =>
                    setCurrentAddon({
                      ...currentAddon,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setCurrentAddon({
                      ...currentAddon,
                      quantity: currentAddon.quantity + 1,
                    })
                  }
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddAddon}
              disabled={!currentAddon.category || !currentAddon.size}
              className="w-full bg-yellow-primary hover:bg-yellow-600"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add to Selection
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
