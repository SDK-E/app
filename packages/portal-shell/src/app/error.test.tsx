import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import AppError from "./error";

// Mirrors `[locale]/layout.tsx`: the boundary renders INSIDE the
// NextIntlClientProvider, so translations resolve. This isolates whether the
// boundary itself can render on the client.
const messages = {
  portal: {
    states: {
      errorTitle: "Something went wrong",
      errorBody: "Please try again.",
      tryAgain: "Try again",
    },
  },
  footer: {
    copyright: "© SDK Enterprises",
  },
};

describe("AppError boundary", () => {
  afterEach(cleanup);

  it("renders inside the locale intl provider", () => {
    const { getByText } = render(
      <NextIntlClientProvider messages={messages} locale="en">
        <AppError error={new Error("boom")} reset={() => {}} />
      </NextIntlClientProvider>
    );

    expect(getByText("Something went wrong")).toBeTruthy();
  });
});
