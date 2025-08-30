import { Fragment } from "react/jsx-runtime";
import { GlobalWrapper } from "./components/wrappers/global-wrapper/GlobalWrapper";
import { Sidebar } from "./components/sidebar/Sidebar";

export const App = () => {
  return (
    <GlobalWrapper>
      <Sidebar />
    </GlobalWrapper>
  );
};
