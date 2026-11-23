"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  Crown,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/components/app-provider";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { currentUser, updateProfile, changePassword } = useApp();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [image, setImage] = useState(currentUser?.image ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [location, setLocation] = useState(currentUser?.location ?? "");
  const [businessName, setBusinessName] = useState(currentUser?.businessName ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  if (!currentUser) return null;

  const dashboardPath =
    currentUser.role === "vendor"
      ? "/dashboard/vendor"
      : currentUser.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/customer";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (currentUser?.role === "vendor" && businessName.trim().length < 2) {
      setError("Vendors must keep a business name.");
      return;
    }
    setSaving(true);
    const result = await updateProfile({
      name,
      image,
      phone,
      location,
      businessName: currentUser?.role === "vendor" ? businessName : undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not update your profile.");
      return;
    }
    toast.success("Profile updated successfully.");
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setPasswordError(
        "New password must be 6+ characters with one uppercase and one lowercase letter.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordSaving(false);
    if (!result.ok) {
      setPasswordError(result.error ?? "Could not change your password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed successfully.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        description="Keep your contact details and public profile up to date."
        action={
          <Button asChild variant="outline">
            <Link href={dashboardPath}>Back to dashboard</Link>
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Your role and subscription can&apos;t be changed from this form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <div className="flex items-center gap-4 rounded-2xl bg-cream p-4">
                <Avatar src={image} name={name || currentUser.name} className="size-16" sizes="64px" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{name || currentUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
                    {currentUser.role === "vendor" && (
                      <Badge variant={currentUser.subscriptionPlan === "premium" ? "premium" : "outline"}>
                        {currentUser.subscriptionPlan === "premium" ? <Crown className="size-3" /> : null}
                        {currentUser.subscriptionPlan ?? "free"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="profile-name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="profile-email">Email address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="profile-email" value={currentUser.email} disabled className="pl-10" />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Email changes are handled securely through Better Auth.
                  </p>
                </div>
              </div>

              {currentUser.role === "vendor" && (
                <div>
                  <Label htmlFor="business-name">Business name</Label>
                  <div className="relative">
                    <Store className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="business-name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="pl-10" required />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 415 555 0100" className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Area / city</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Gulshan, Dhaka" className="pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="profile-image">Profile image URL</Label>
                <Input
                  id="profile-image"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Info className="size-3" /> Optional. In production, profile images can be uploaded through ImgBB.
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName(currentUser.name);
                    setImage(currentUser.image);
                    setPhone(currentUser.phone ?? "");
                    setLocation(currentUser.location ?? "");
                    setBusinessName(currentUser.businessName ?? "");
                    setError("");
                    toast.info("Form reset to your saved details.");
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save /> {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-[#2f6b4f]" /> Account details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                {currentUser.isBlocked ? (
                  <Badge variant="destructive">Blocked</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
              {currentUser.role === "vendor" && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Plan</span>
                  <Badge variant={currentUser.subscriptionPlan === "premium" ? "premium" : "outline"} className="capitalize">
                    {currentUser.subscriptionPlan ?? "free"}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-semibold">{formatDate(currentUser.createdAt)}</span>
              </div>
              {currentUser.role === "vendor" && currentUser.subscriptionExpiresAt && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Premium renews</span>
                  <span className="font-semibold">{formatDate(currentUser.subscriptionExpiresAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-[#2f6b4f]" /> Security
              </CardTitle>
              <CardDescription>Protected by Better Auth in production.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Passwords are hashed and session tokens are issued server-side. Role and
              subscription fields are never editable from profile updates, and blocked accounts
              lose access to protected features immediately.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" /> Change password
              </CardTitle>
              <CardDescription>
                Use at least 6 characters with one uppercase and one lowercase letter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitPassword} className="grid gap-3">
                <div>
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="settings-new-password">New password</Label>
                  <Input
                    id="settings-new-password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                  <Input
                    id="settings-confirm-password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswords((value) => !value)}
                  className="flex items-center gap-1.5 text-left text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {showPasswords ? "Hide passwords" : "Show passwords"}
                </button>

                {passwordError && (
                  <p className="flex items-start gap-2 rounded-xl bg-[#fde7e4] p-3 text-xs font-medium text-[#a3271a]">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" /> {passwordError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={passwordSaving}>
                  <KeyRound /> {passwordSaving ? "Updating…" : "Update password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
