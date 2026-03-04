import { type LucideIcon } from "lucide-react";
import { NavMain } from "#/components/nav-main";
import { NavUser } from "#/components/nav-user";
import { TeamSwitcher } from "#/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "#/components/ui/sidebar";
import type { User } from "better-auth";

export function AppSidebar({
  user,
  data,
  groupLabel,
}: {
  user: User;
  data: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive: boolean;
  }[];
  groupLabel: string;
}) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} groupLabel={groupLabel} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
