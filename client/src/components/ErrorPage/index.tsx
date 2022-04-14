import React from "react";
import { Link } from "react-router-dom";

const ErrorPage: React.FC<{ error: Error }> = ({
    error,
}): React.ReactElement => (
    <div>
        <h1>Something went wrong.</h1>
        <p>{error.message}</p>
        <Link to="/">Go back home</Link>
    </div>
);

export default ErrorPage;
