"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Crown,
  ImagePlus,
  Info,
  Pizza,
  Save,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, locations } from "@/lib/data";
import { uploadImage } from "@/lib/upload";
import type { MenuItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

export function MenuItemForm({
  mode,
  item,
}: {
  mode: "create" | "edit";
  item?: MenuItem;
}) {
  const router = useRouter();
  const { currentUser, addMenuItem, updateMenuItem } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [itemName, setItemName] = useState(item?.itemName ?? "");
  const [category, setCategory] = useState(item?.category ?? categories[0].name);
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [location, setLocation] = useState(item?.location ?? currentUser?.location ?? "");
  const [images, setImages] = useState<string[]>(item?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);

  if (!currentUser) return null;
  const isPremium = currentUser.subscriptionPlan === "premium";

  function addUrl() {
    const value = imageUrl.trim();
    if (!value) return;
    if (!/^https?:\/\//i.test(value)) {
      toast.error("Image URL must start with http:// or https://");
      return;
    }
    setImages((prev) => [...prev, value]);
    setImageUrl("");
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 3);
    setUploading((count) => count + selected.length);

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        setUploading((count) => Math.max(0, count - 1));
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Please use an image smaller than 8MB.");
        setUploading((count) => Math.max(0, count - 1));
        continue;
      }

      try {
        const result = await uploadImage(file);
        setImages((prev) => [...prev, result.url]);
        if (result.warning) {
          toast.warning(result.warning);
        } else {
          toast.success(
            result.provider === "imgbb"
              ? "Image uploaded to ImgBB and compressed."
              : "Image compressed and added to the gallery.",
          );
        }
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error ? uploadError.message : "Could not process that image.",
        );
      } finally {
        setUploading((count) => Math.max(0, count - 1));
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const numericPrice = Number(price);
    if (itemName.trim().length < 3) {
      setError("Please enter a menu item name (at least 3 characters).");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than 0.");
      return;
    }
    if (description.trim().length < 20) {
      setError("Add a description of at least 20 characters so customers know what to expect.");
      return;
    }
    if (location.trim().length < 3) {
      setError("Add the vendor area or city.");
      return;
    }
    if (images.length === 0) {
      setError("At least one item image is required.");
      return;
    }
    setSaving(true);
    const payload = {
      itemName,
      category,
      description,
      price: Number(numericPrice.toFixed(2)),
      location,
      images,
    };
    const result =
      mode === "create"
        ? await addMenuItem(payload)
        : await updateMenuItem(item?.id ?? "", payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save the menu item.");
      return;
    }
    toast.success(
      mode === "create"
        ? "Menu item submitted. An admin will review it before it goes live."
        : "Menu item updated successfully.",
    );
    router.push("/dashboard/vendor/menu");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vendor dashboard"
        title={mode === "create" ? "Add a menu item" : "Edit menu item"}
        description={
          mode === "create"
            ? "New items are submitted for admin approval before customers can see them."
            : "Update the details, photos or price. Rejected items go back for review."
        }
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/vendor/menu">
              <ArrowLeft /> Back to my menu
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={submit}>
          <Card className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="item-name">Item name</Label>
                <Input
                  id="item-name"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="e.g. Smoky BBQ Chicken"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="14.90"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="location">Location (area / city)</Label>
                <Input
                  id="location"
                  list="location-options"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Gulshan, Dhaka"
                  required
                />
                <datalist id="location-options">
                  {locations.map((entry) => (
                    <option key={entry} value={entry} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the toppings, crust and what makes this item special."
                  className="min-h-28"
                  required
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {description.trim().length}/200 characters · at least 20 required
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label>Item images (required)</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((src, index) => (
                    <div
                      key={`${src.slice(0, 30)}-${index}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary"
                    >
                      <Image src={src} alt={`Item preview ${index + 1}`} fill sizes="160px" className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-[#2a1710]/80 text-white hover:bg-destructive"
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold">
                          Main photo
                        </span>
                      )}
                    </div>
                  ))}

                  <label
                    htmlFor="image-upload"
                    className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d8bfa9] bg-[#fffaf4] text-center text-[11px] font-semibold text-muted-foreground transition hover:border-primary hover:bg-cream hover:text-primary"
                  >
                    <Upload className={cn("size-5", uploading > 0 && "animate-pulse")} />
                    {uploading > 0 ? "Processing…" : "Upload image"}
                    <span className="text-[9px] font-normal">JPG, PNG or WebP · 8MB max</span>
                  </label>
                  <input
                    ref={fileRef}
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="sr-only"
                    disabled={uploading > 0}
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="Or paste an image URL"
                    aria-label="Image URL"
                  />
                  <Button type="button" variant="outline" onClick={addUrl}>
                    <ImagePlus /> Add URL
                  </Button>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  Images are compressed in your browser and uploaded to ImgBB through the
                  PizzaHub API before the item is saved.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/dashboard/vendor/menu">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                <Save /> {saving ? "Saving…" : mode === "create" ? "Submit for review" : "Save changes"}
              </Button>
            </div>
          </Card>
        </form>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-secondary">
              {images[0] ? (
                <Image src={images[0]} alt="Preview" fill sizes="400px" className="object-cover" unoptimized />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <Pizza className="size-12 opacity-30" />
                </div>
              )}
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge variant="dark" className="bg-[#2a1710]/80 text-white">
                  {category}
                </Badge>
                {isPremium && (
                  <Badge variant="premium">
                    <Crown className="size-3" /> Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Live card preview</p>
              <h3 className="mt-1 text-lg font-bold">{itemName || "Your item name"}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {description || "Your description will appear here, giving customers a taste of what to expect."}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-extrabold text-primary">
                  {formatCurrency(Number(price) || 0)}
                </span>
                <span className="text-xs text-muted-foreground">{location || "Location"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Plan &amp; publishing</p>
              <Badge variant={isPremium ? "premium" : "outline"}>
                {isPremium ? "Premium" : "Free plan"}
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {isPremium
                ? "You have unlimited active menu items. New items still require admin approval."
                : "You can have up to 3 active approved items. Upgrade to Premium for unlimited items and featured placement."}
            </p>
            {!isPremium && (
              <Button asChild size="sm" variant="gold" className="mt-3 w-full">
                <Link href="/dashboard/vendor/subscription">
                  <Crown /> Upgrade to Premium
                </Link>
              </Button>
            )}
            <div className="mt-3 rounded-lg bg-cream p-2.5 text-[11px] leading-5 text-muted-foreground">
              Status after saving:{" "}
              <span className="font-semibold text-foreground">
                {mode === "edit" && item?.status === "approved" ? "Approved" : "Pending review"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
