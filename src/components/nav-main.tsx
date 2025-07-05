"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      buttonComponent?: any
      icon?: LucideIcon
    }[]
  }[]
}) {
  const router = useRouter()
  const pathname = usePathname() // Get the current pathname

  return (
    <SidebarGroup>
    <SidebarMenu>
      {items.map((item) => {
        // Check if the parent URL matches the current pathname
        const isParentActive = item.url ? pathname === item.url : false;
        // Check if any sub-item URL matches the current pathname
        const isChildActive = item.items
          ? item.items.some((subItem) => pathname === subItem.url)
          : false;
        // Set isActive to true if either the parent or any child is active
        const isActive = isParentActive || isChildActive;

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isActive} // Open the collapsible if the parent or any child is active
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className="mx-auto">
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "flex items-center w-full p-2 rounded-md transition-colors  hover:bg-primary/10 mb-2 !cursor-pointer",
                    isActive && "bg-primary/20"
                  )}
                  onClick={() => {
                    if (item.url) {
                      router.push(item.url)
                    }
                  }} 
                >
                {item.icon && <item.icon className="mr-2" />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                        {subItem.buttonComponent ? (
                          subItem.buttonComponent
                        ): (
                          <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "flex items-center w-full p-2 rounded-md transition-colors",
                            isSubActive
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "hover:bg-accent"
                          )}
                        >
                          <div onClick={() => router.push(subItem.url)} className="cursor-pointer">
                            {subItem.icon && <subItem.icon className="mr-2" />}
                            <span>{subItem.title}</span>
                          </div>
                        </SidebarMenuSubButton>
                        )
                        }
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  </SidebarGroup>
  )
}