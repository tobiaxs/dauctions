import { render, screen } from "@testing-library/react";
import React from "react";
import App from ".";
import AppProviders from "../context";

test("displays home page", async () => {
    render(<App />, { wrapper: AppProviders });

    expect(screen.getByText(/app is running/i)).toBeInTheDocument();
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
});
