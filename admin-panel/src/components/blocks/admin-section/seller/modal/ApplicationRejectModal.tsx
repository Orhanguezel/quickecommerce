"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import React, { useState } from "react";

interface ApplicationRejectModalProps {
  trigger: React.ReactNode;
  onReject: (note: string) => void;
  loading?: boolean;
}

const ApplicationRejectModal = ({
  trigger,
  onReject,
  loading,
}: ApplicationRejectModalProps) => {
  const [adminNote, setAdminNote] = useState("");
  const [open, setOpen] = useState(false);

  const handleReject = () => {
    if (!adminNote.trim()) return;
    onReject(adminNote);
    setOpen(false);
    setAdminNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Başvuruyu Reddet</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ret Sebebi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Ret sebebini yazınız..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
          />
          {!adminNote.trim() && (
            <p className="text-xs text-red-500 mt-1">
              Ret sebebi zorunludur.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!adminNote.trim() || loading}
          >
            {loading ? "İşleniyor..." : "Reddet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationRejectModal;
