import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import ErrorPage from "../components/ErrorPage";

const NOT_FOUND_ERROR = new Error("Page you are looking for was not found!");

const Layout = () => {
    return (
        <div>
            <h1>App is running</h1>
            <Outlet />
        </div>
    );
};

const HomePage = () => {
    return <h1>Home Page</h1>;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route
                    path="*"
                    element={<ErrorPage error={NOT_FOUND_ERROR} />}
                />
            </Route>
        </Routes>
    );
};

export default App;
