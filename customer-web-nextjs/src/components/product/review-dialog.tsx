"use client";

import { useState } from "react";
import { Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitReviewMutation } from "@/modules/product/product-review.service";

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
  const [submitted, setSubmitted] = useState(false);
  const submitReview = useSubmitReviewMutation();

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
