import { Avatar, AvatarFallback } from "@platform/ui/Avatar";
import { Button } from "@platform/ui/Button";
import { Checkbox } from "@platform/ui/Checkbox";
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
} from "@platform/ui/DropdownMenu";
import { Input } from "@platform/ui/Input";
import { Label } from "@platform/ui/Label";
import { Progress } from "@platform/ui/Progress";
import { RadioGroup, RadioGroupItem } from "@platform/ui/RadioGroup";
import { Section } from "@platform/ui/Section";
import { SectionHeader } from "@platform/ui/SectionHeader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@platform/ui/Select";
import { Separator } from "@platform/ui/Separator";
import { Switch } from "@platform/ui/Switch";
import { Textarea } from "@platform/ui/Textarea";
import { Trash2, UserRound } from "lucide-react";

import { Block } from "./block";
import { PrimitivesSpinnerSection } from "./PrimitivesSpinnerSection";

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
            <Input
              id="ds-name"
              placeholder="AI Support Automation"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-disabled">Disabled</Label>
            <Input
              id="ds-disabled"
              placeholder="Read only"
              disabled
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-invalid">Invalid</Label>
            <Input
              id="ds-invalid"
              defaultValue="sdk@"
              aria-invalid
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ds-brief">Brief</Label>
            <Textarea
              id="ds-brief"
              rows={3}
              placeholder="What are we building?"
            />
          </div>
        </Block>

        <Block title="Selection">
          <div className="flex items-center gap-3">
            <Checkbox
              id="ds-check"
              defaultChecked
            />
            <Label htmlFor="ds-check">Include staging</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="ds-switch"
              defaultChecked
            />
            <Label htmlFor="ds-switch">Production alerts</Label>
          </div>
          <RadioGroup
            defaultValue="viewer"
            className="gap-1"
          >
            {["Viewer", "Project member", "Billing"].map((role, i) => (
              <div
                key={role}
                className="flex items-center gap-3"
              >
                <RadioGroupItem
                  id={`ds-role-${i}`}
                  value={role.toLowerCase().replace(" ", "-")}
                />
                <Label
                  htmlFor={`ds-role-${i}`}
                  className="normal-case tracking-normal"
                >
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
            <Separator
              orientation="vertical"
              className="h-full"
            />
            <span className="text-body">Vertical</span>
            <Separator
              orientation="vertical"
              className="h-full"
            />
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
            <SelectTrigger
              id="ds-select"
              aria-label="Access role"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="member">Project member</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectSeparator />
                <SelectItem
                  value="remove"
                  variant="destructive"
                >
                  Remove access
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Block>

        <Block title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
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

        <PrimitivesSpinnerSection />
      </div>
    </Section>
  );
}
