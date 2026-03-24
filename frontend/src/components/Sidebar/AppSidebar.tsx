import { ClipboardList, DollarSign } from "lucide-react";

import { Logo } from "@/components/Common/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { type Item, Main } from "./Main";

const items: Item[] = [
  { icon: ClipboardList, title: "Worklogs", path: "/" },
  { icon: DollarSign, title: "Payment Review", path: "/payment-review" },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export default AppSidebar;
