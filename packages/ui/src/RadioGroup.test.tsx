import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Label } from "@sdk-e/ui/Label";
import { RadioGroup, RadioGroupItem } from "@sdk-e/ui/RadioGroup";

function renderGroup() {
  return render(
    <RadioGroup defaultValue="viewer">
      {["viewer", "member", "billing"].map((role) => (
        <div key={role} className="flex items-center gap-2">
          <RadioGroupItem id={`role-${role}`} value={role} />
          <Label htmlFor={`role-${role}`}>{role}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  afterEach(() => cleanup());

  it("selects one item at a time on click", () => {
    const { getAllByRole } = renderGroup();
    const radios = getAllByRole("radio") as HTMLInputElement[];

    expect(radios[0].dataset.state).toBe("checked");
    fireEvent.click(radios[1]);
    expect(radios[0].dataset.state).toBe("unchecked");
    expect(radios[1].dataset.state).toBe("checked");
  });

  it("selects an item via its associated label", () => {
    const { getAllByRole, getByText } = renderGroup();
    const radios = getAllByRole("radio");

    fireEvent.click(getByText("billing"));
    expect(radios[2].dataset.state).toBe("checked");
    expect(radios[0].dataset.state).toBe("unchecked");
  });
});
