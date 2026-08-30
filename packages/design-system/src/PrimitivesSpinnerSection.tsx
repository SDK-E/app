import { Badge } from "@platform/ui/Badge";
import { Button } from "@platform/ui/Button";
import { IconButton } from "@platform/ui/IconButton";
import { Spinner } from "@platform/ui/Spinner";
import { Settings, UserRound } from "lucide-react";

import { Block } from "./block";

export function PrimitivesSpinnerSection() {
  return (
    <Block title="Spinner & icon button">
      <div className="flex items-center gap-4 text-foreground">
        <Spinner size="sm" />
        <Spinner />
        <Spinner
          size="lg"
          label="Loading projects"
        />
        <Spinner
          className="text-primary"
          label="Syncing"
        />
      </div>
      <div className="flex items-center gap-2">
        <IconButton aria-label="Settings">
          <Settings />
        </IconButton>
        <IconButton
          aria-label="Profile"
          size="sm"
        >
          <UserRound />
        </IconButton>
        <Button
          variant="ghost"
          size="sm"
          disabled
        >
          <Spinner
            size="sm"
            label=""
          />
          Saving…
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="live">Live</Badge>
        <Badge tone="review">Review</Badge>
      </div>
    </Block>
  );
}
