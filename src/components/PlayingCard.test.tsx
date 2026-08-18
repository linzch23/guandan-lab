import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayingCard } from "./PlayingCard";

describe("PlayingCard", () => {
  it("exposes suit, rank, and wildcard meaning", () => {
    render(<PlayingCard code="H-6" levelRank="6" />);
    expect(screen.getByLabelText("红桃6，逢人配")).toBeInTheDocument();
  });
});
