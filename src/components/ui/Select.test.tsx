import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

function renderSelect() {
  return render(
    <div>
      <Label htmlFor="ds-role">Access role</Label>
      <Select defaultValue="member">
        <SelectTrigger id="ds-role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">Viewer</SelectItem>
          <SelectItem value="member">Project member</SelectItem>
          <SelectItem value="billing">Billing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

describe("Select", () => {
  afterEach(() => cleanup());

  it("opens from the keyboard and commits the highlighted item", () => {
    const { getByRole } = renderSelect();
    const trigger = getByRole("combobox");

    expect(screen.queryByRole("option", { name: "Viewer" })).toBeNull();

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(getByRole("option", { name: "Viewer" })).not.toBeNull();

    fireEvent.keyDown(getByRole("option", { name: "Project member" }), {
      key: "Enter",
    });

    expect(trigger.textContent).toContain("Project member");
  });

  it("associates the label with the trigger for assistive naming", () => {
    const { getByRole } = renderSelect();
    expect(getByRole("combobox").getAttribute("id")).toBe("ds-role");
  });
});
