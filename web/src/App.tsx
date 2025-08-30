import { GlobalWrapper } from "@components/wrappers/global-wrapper/GlobalWrapper";
import { Sidebar } from "@components/sidebar/Sidebar";
import { RouterWrapper } from "@components/wrappers/router-wrapper/RouterWrapper";
import { Header } from "@components/header/Header";
import { Router } from "@components/router/Router";
import { Fragment } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";

export const App = () => {
  const isAuthenticated = false;
  return (
    <GlobalWrapper>
      {isAuthenticated ? (
        <Fragment>
          <Sidebar />
          <Header />
          <RouterWrapper>
            <Router />
          </RouterWrapper>
        </Fragment>
      ) : (
        <Fragment>
          <RouterWrapper>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </RouterWrapper>
        </Fragment>
      )}
    </GlobalWrapper>
  );
};
