import React from "react";
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

interface OpBfrImgProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItemId: string | null;
}

export default function OpBfrImg({ open, onOpenChange, lineItemId }: OpBfrImgProps) {
  // Placeholder upload handler
  const handleUpload = () => {
    // TODO: Implement upload logic
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <h2 className="text-lg font-bold">Upload Before Image</h2>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">
              Line Item ID: <span className="font-mono">{lineItemId}</span>
            </p>
            {/* Upload form will go here */}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <h5 className="extra-bold">Cancel</h5>
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleUpload}
          >
            <h5 className="extra-bold">Upload</h5>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}