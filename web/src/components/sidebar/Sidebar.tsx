import { SidebarHeader } from "./sidebar-header/SidebarHeader";
import { SidebarContent } from "./sidebar-content/SidebarContent";
import { SidebarWrapper } from "../wrappers/sidebar-wrapper/SidebarWrapper";

export const Sidebar = () => {
  return (
    <SidebarWrapper>
      <SidebarHeader />
      <SidebarContent />
    </SidebarWrapper>
  );
};
