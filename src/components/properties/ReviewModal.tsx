/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@woothomes/components/ui/dialog";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";

type ReviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: any;
};

export function ReviewModal({ open, onOpenChange, review }: ReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle asChild> </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-3">
              <Image
                src={review && review.image ? review.image : "/images/fallback-avatar.jpg"}
                alt="avatar"
                width={10}
                height={10}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{review?.name || ""}</p>
                <div className="flex gap-1 text-yellow-500">⭐⭐⭐⭐☆</div>
              </div>
              <p className="ml-auto text-xs text-muted-foreground">
                {review?.date ? `${review.date} ago` : ""}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 mt-4">
          <div>
            <p className="text-sm font-ligher tracking-tight text-muted-foreground">
              {review?.description || ""}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          {/* <Button onClick={() => {}}>Cancel</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
