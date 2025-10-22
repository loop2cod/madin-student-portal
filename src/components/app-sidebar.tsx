"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  User,
  FileText,
  LogOut,
  Users,
  MessageCircle,
  UserPlus,
  BarChart3,
  Settings,
  Building,
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  History
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';


// Student navigation items
const studentNavigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: GalleryVerticalEnd,
  },
  {
    title: "My Application",
    url: "/application",
    icon: FileText,
  },
  {
    title: "Student Requests",
    url: "/certificates",
    icon: Award,
  },
  {
    title: "Fee Payment",
    url: "/fee-payment",
    icon: CreditCard,
  },
  {
    title: "Payment History",
    url: "/payment-history",
    icon: History,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: BookOpen,
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
  }
];



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Get user data from localStorage or API call
    const userData = localStorage.getItem('studentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('studentUser');
    Cookies.remove('token');
    
    // Redirect to login
    router.push('/auth/login');
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-primary-foreground-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-primary-foreground-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary-foreground-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-primary-foreground-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-6 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mx-auto">
            <GraduationCap className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              MADIN Student Portal
            </span>
            <span className="truncate text-xs">College of Engineering & Management</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={studentNavigationItems} />
      </SidebarContent>
      
      <SidebarFooter>
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : user ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-3">
              <Badge variant="secondary" className="text-xs w-fit">
                <User className="w-3 h-3 mr-1" />
                Student
              </Badge>
              {user.admissionNumber && (
                <Badge variant="outline" className="text-xs w-fit">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {user.admissionNumber}
                </Badge>
              )}
              {user.department && (
                <Badge variant="outline" className="text-xs w-fit">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {user.department}
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <Button 
              onClick={() => router.push('/auth/login')}
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
