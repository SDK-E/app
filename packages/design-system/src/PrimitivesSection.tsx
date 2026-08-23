import { Section } from "@sdk-e/ui/Section";
import { SectionHeader } from "@sdk-e/ui/SectionHeader";
import { Avatar, AvatarFallback } from "@sdk-e/ui/Avatar";
import { Badge } from "@sdk-e/ui/Badge";
import { Button } from "@sdk-e/ui/Button";
import { Checkbox } from "@sdk-e/ui/Checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@sdk-e/ui/DropdownMenu";
import { IconButton } from "@sdk-e/ui/IconButton";
import { Input } from "@sdk-e/ui/Input";
import { Label } from "@sdk-e/ui/Label";
import { Progress } from "@sdk-e/ui/Progress";
import { RadioGroup, RadioGroupItem } from "@sdk-e/ui/RadioGroup";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@sdk-e/ui/Select";
import { Separator } from "@sdk-e/ui/Separator";
import { Spinner } from "@sdk-e/ui/Spinner";
import { Switch } from "@sdk-e/ui/Switch";
import { Textarea } from "@sdk-e/ui/Textarea";
import { Settings, Trash2, UserRound } from "lucide-react";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-72 flex-1 space-y-4 rounded-card border border-border bg-card p-6">
      <h3 className="text-label font-extrabold uppercase tracking-label text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PrimitivesSection() {
  return (
    <Section id="primitives">
      <SectionHeader
        eyebrow="04 · Primitives"
        title="Form controls, selection and menus."
        intro="Semantic tokens only — every control flips with the theme. Focus rings follow the button family, touch targets stay above 44px."
      />
      <div className="flex flex-wrap gap-3">
        <Block title="Text fields">
          <div className="space-y-1">
            <Label htmlFor="ds-name">Project name</Label>
            <Input id="ds-name" placeholder="AI Support Automation" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-disabled">Disabled</Label>
            <Input id="ds-disabled" placeholder="Read only" disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-invalid">Invalid</Label>
            <Input id="ds-invalid" defaultValue="sdk@" aria-invalid />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-brief">Brief</Label>
            <Textarea id="ds-brief" rows={3} placeholder="What are we building?" />
          </div>
        </Block>

        <Block title="Selection">
          <div className="flex items-center gap-3">
            <Checkbox id="ds-check" defaultChecked />
            <Label htmlFor="ds-check">Include staging</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ds-switch" defaultChecked />
            <Label htmlFor="ds-switch">Production alerts</Label>
          </div>
          <RadioGroup defaultValue="viewer" className="gap-1">
            {["Viewer", "Project member", "Billing"].map((role, i) => (
              <div key={role} className="flex items-center gap-3">
                <RadioGroupItem id={`ds-role-${i}`} value={role.toLowerCase().replace(" ", "-")} />
                <Label htmlFor={`ds-role-${i}`} className="normal-case tracking-normal">
                  {role}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Block>

        <Block title="Structure & progress">
          <div className="space-y-3">
            <Progress value={25} />
            <Progress value={60} />
            <Progress value={90} />
          </div>
          <Separator />
          <div className="flex h-8 items-center gap-3">
            <Separator orientation="vertical" className="h-full" />
            <span className="text-body">Vertical</span>
            <Separator orientation="vertical" className="h-full" />
          </div>
        </Block>

        <Block title="Avatars">
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>HD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>Sdk</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>Acp</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <UserRound className="size-5 text-muted-foreground" />
            </Avatar>
          </div>
        </Block>

        <Block title="Select">
          <Select defaultValue="member">
            <SelectTrigger id="ds-select" aria-label="Access role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="member">Project member</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectSeparator />
                <SelectItem value="remove" variant="destructive">
                  Remove access
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Block>

        <Block title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Signed in</DropdownMenuLabel>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Preferences</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem checked>Email digests</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Weekly summary</DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 /> Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Block>

        <Block title="Spinner & icon button">
          <div className="flex items-center gap-4 text-foreground">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" label="Loading projects" />
            <Spinner className="text-primary" label="Syncing" />
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="Settings">
              <Settings />
            </IconButton>
            <IconButton aria-label="Profile" size="sm">
              <UserRound />
            </IconButton>
            <Button variant="ghost" size="sm" disabled>
              <Spinner size="sm" label="" />
              Saving…
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="live">Live</Badge>
            <Badge tone="review">Review</Badge>
          </div>
        </Block>
      </div>
    </Section>
  );
}
