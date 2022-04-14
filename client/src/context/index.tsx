import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter as Router } from "react-router-dom";
import ErrorPage from "../components/ErrorPage";

/**
 * Provider classes for the app component
 * @param {React.ReactNode} {children} passed children.
 * @returns {React.ReactElement} app wrapped in providers.
 */
const AppProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
}): React.ReactElement => (
    <ErrorBoundary FallbackComponent={ErrorPage}>
        <Router>{children}</Router>
    </ErrorBoundary>
);

export default AppProviders;
