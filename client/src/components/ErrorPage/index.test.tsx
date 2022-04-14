import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ErrorPage from ".";

const HomePage = () => <Link to="/jon-snow">Go to Jon Snow</Link>;

test("shows the error and redirects to homepage", () => {
    const error = new Error("You know nothing, Jon Snow");

    render(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jon-snow" element={<ErrorPage error={error} />} />
            </Routes>
        </BrowserRouter>
    );

    const jonSnowButton = screen.getByRole("link", {
        name: /go to jon snow/i,
    });
    userEvent.click(jonSnowButton);

    expect(screen.getByText(/You know nothing, Jon Snow/i)).toBeInTheDocument();

    const homeButton = screen.getByRole("link", { name: /go back home/i });
    userEvent.click(homeButton);

    expect(
        screen.getByRole("link", { name: /go to jon snow/i })
    ).toBeInTheDocument();
});
