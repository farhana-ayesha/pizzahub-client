"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Globe, Info } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GoogleAuthDialog({
  open,
  onOpenChange,
  mode,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "signin" | "signup";
  onContinue: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    setError("");
    setLoading(true);
    const result = await onContinue();
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Could not continue with Google.");
      return;
    }
    toast.success("Signed in with the demo Google account.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl border border-border bg-white">
              <GoogleIcon />
            </span>
            Continue with Google
          </DialogTitle>
          <DialogDescription>
            Google authentication is wired to Better Auth. Configure{" "}
            <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            and the Google client credentials on the server to use the real consent screen.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-[#efd9b7] bg-[#fff8eb] p-3 text-xs leading-5 text-[#6f4a17]">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              This preview is running without the auth server, so we&apos;ll use a local demo
              Google account instead. {mode === "signup" ? "A customer account will be created." : "You'll be signed in as a customer."}
            </span>
          </p>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={loading}>
            {loading ? "Connecting…" : "Continue with demo Google"} <ArrowRight />
          </Button>
        </DialogFooter>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Globe className="size-3" /> A real Google button appears when OAuth is configured.
        </p>
      </DialogContent>
    </Dialog>
  );
}
