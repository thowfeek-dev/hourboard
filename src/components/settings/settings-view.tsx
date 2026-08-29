"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import { clearAllData, updateSettings } from "@/server/actions";
import { SHORTCUTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsDTO } from "@/types";

export function SettingsView({ settings }: { settings: SettingsDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  return (
    <div className="relative z-10 space-y-5">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">⚙️ Settings</p>
        <h1 className="gradient-text text-3xl font-semibold tracking-tight">Make it yours</h1>
      </div>
      <AccountCard />
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            action={async (form) => {
              await updateSettings({
                dailyTargetHours: Number(form.get("dailyTargetHours")),
                dailyTargetTasks: settings.dailyTargetTasks,
                dailySlots: Number(form.get("dailySlots")),
                weekStartDay: Number(form.get("weekStartDay")) as 0 | 1 | 6,
                theme: String(form.get("theme")) as SettingsDTO["theme"],
                defaultPriority: settings.defaultPriority,
                exportFormat: String(form.get("exportFormat")) as SettingsDTO["exportFormat"],
                timeFormat: String(form.get("timeFormat")) as SettingsDTO["timeFormat"],
                dateFormat: String(form.get("dateFormat")) as SettingsDTO["dateFormat"],
                monthTarget: Number(form.get("monthTarget")),
              });
              toast.success("Settings saved ✨");
              router.refresh();
            }}
          >
            <Field label="Daily hours target" name="dailyTargetHours" type="number" defaultValue={settings.dailyTargetHours} />
            <Field label="Daily slots" name="dailySlots" type="number" defaultValue={settings.dailySlots} />
            <Field label="Month hours target" name="monthTarget" type="number" defaultValue={settings.monthTarget} />
            <label className="grid gap-1 text-sm">
              <Label htmlFor="weekStartDay">Week starts</Label>
              <select id="weekStartDay" name="weekStartDay" defaultValue={settings.weekStartDay} className="h-10 rounded-md border border-input bg-transparent px-3 text-foreground">
                <option value={1}>Monday</option>
                <option value={0}>Sunday</option>
                <option value={6}>Saturday</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <Label htmlFor="theme">Theme</Label>
              <select id="theme" name="theme" defaultValue={settings.theme} className="h-10 rounded-md border border-input bg-transparent px-3 text-foreground ">
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <Label htmlFor="exportFormat">Default export</Label>
              <select id="exportFormat" name="exportFormat" defaultValue={settings.exportFormat} className="h-10 rounded-md border border-input bg-transparent px-3 text-foreground ">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <Label htmlFor="timeFormat">Time format</Label>
              <select id="timeFormat" name="timeFormat" defaultValue={settings.timeFormat} className="h-10 rounded-md border border-input bg-transparent px-3 text-foreground ">
                <option value="24h">24h</option>
                <option value="12h">12h</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <Label htmlFor="dateFormat">Date format</Label>
              <select id="dateFormat" name="dateFormat" defaultValue={settings.dateFormat} className="h-10 rounded-md border border-input bg-transparent px-3 text-foreground ">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <Button type="submit">💾 Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>⌨️ Keyboard shortcuts</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((item) => (
            <div key={item.keys} className="flex justify-between gap-3 text-sm">
              <span>{item.action}</span>
              <kbd className="font-mono text-xs text-muted-foreground">{item.keys}</kbd>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Wipe every task, day log, chart, project, tag, and review on your account. Other users are not affected. Settings reset to the 8-hour default. This cannot be undone.
          </p>
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setConfirm("");
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 /> Clear all data
              </Button>
            </DialogTrigger>
            <DialogContent title="Clear all data?">
              <p className="text-sm text-muted-foreground">
                This deletes the entire Hourboard history so you can start from scratch. Type <strong>CLEAR</strong> to confirm.
              </p>
              <Input
                className="mt-3"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type CLEAR"
                aria-label="Type CLEAR to confirm"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={pending || confirm !== "CLEAR"}
                  onClick={() =>
                    startTransition(async () => {
                      await clearAllData();
                      toast.success("All data cleared. Fresh board ✨");
                      setOpen(false);
                      setConfirm("");
                      router.push("/");
                      router.refresh();
                    })
                  }
                >
                  <Trash2 /> Delete everything
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountCard() {
  const { user } = useUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="font-medium">{user?.fullName ?? "Signed in"}</p>
        <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
        <p className="pt-2 text-muted-foreground">
          Tasks, projects, and exports on this board belong only to this account. Use the avatar in the header to manage your profile or sign out.
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, name, type, defaultValue }: { label: string; name: string; type: string; defaultValue: number }) {
  return (
    <label className="grid gap-1 text-sm">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </label>
  );
}
