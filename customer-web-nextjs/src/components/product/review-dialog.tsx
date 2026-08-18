"use client";

import { useState } from "react";
import { Star, Loader2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitReviewMutation } from "@/modules/product/product-review.service";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB (backend ile ayni)

interface ReviewDialogProps {
  orderId: number;
  storeId: number;
  productId: number;
  productName: string;
  onClose: () => void;
  translations: {
    write_review: string;
    review_placeholder: string;
    submit_review: string;
    submitting: string;
    review_success: string;
    close: string;
    add_photos?: string;
    photos_hint?: string;
  };
}

export function ReviewDialog({
  orderId,
  storeId,
  productId,
  productName,
  onClose,
  translations: t,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const submitReview = useSubmitReviewMutation();

  function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // ayni dosya tekrar secilebilsin
    const valid = picked.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES
    );
    const next = [...images, ...valid].slice(0, MAX_IMAGES);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function handleSubmit() {
    if (rating === 0 || !reviewText.trim()) return;

    submitReview.mutate(
      {
        order_id: orderId,
        store_id: storeId,
        reviewable_id: productId,
        reviewable_type: "product",
        review: reviewText.trim(),
        rating,
        images: images.length > 0 ? images : undefined,
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{t.write_review}</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Star className="h-6 w-6 fill-green-600 text-green-600" />
            </div>
            <p className="font-medium">{t.review_success}</p>
            <Button className="mt-4" size="sm" onClick={onClose}>
              {t.close}
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{productName}</p>

            {/* Star Rating */}
            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      i < (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t.review_placeholder}
              rows={4}
              maxLength={1000}
              className="mb-4 w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {/* Görsel Yükleme */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-16 w-16 overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`review-${i}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                    <ImagePlus className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleAddImages}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.photos_hint ?? "İsteğe bağlı — en fazla 5 fotoğraf (her biri 4MB)"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                {t.close}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={rating === 0 || !reviewText.trim() || submitReview.isPending}
              >
                {submitReview.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : null}
                {submitReview.isPending ? t.submitting : t.submit_review}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
