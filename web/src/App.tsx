import { GlobalWrapper } from "@components/wrappers/global-wrapper/GlobalWrapper";
import { Sidebar } from "@components/sidebar/Sidebar";
import { RouterWrapper } from "@components/wrappers/router-wrapper/RouterWrapper";
import { Header } from "@components/header/Header";
import { Router } from "@components/router/Router";

export const App = () => {
  return (
    <GlobalWrapper>
      <Sidebar />
      <Header />
      <RouterWrapper>
        <Router />
      </RouterWrapper>
    </GlobalWrapper>
  );
};
