"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  User,
  FileText,
  LogOut,
  User,
  MessageCircle
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

// Role-based navigation items
const getNavigationItems = (user: any) => {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: GalleryVerticalEnd,
      permission: "view_admin_dashboard"
    }
  ];

  // Super Admin items
  if (user?.role === 'super_admin') {
    items.push(
      {
        title: "User Management",
        url: "/users",
        icon: Users,
        permission: "view_all_users"
      },
      {
        title: "All Applications",
        url: "/applications",
        icon: FileText,
        permission: "view_all_applications"
      },
      {
        title: "Quick Admission",
        url: "/quick-admission",
        icon: UserPlus,
        permission: "view_all_applications"
      },
      {
        title: "WhatsApp Portal",
        url: "/whatsapp",
        icon: MessageCircle,
        permission: "view_all_applications"
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        permission: "view_analytics"
      },
      {
        title: "System Settings",
        url: "/settings",
        icon: Settings,
        permission: "manage_settings"
      }
    );
  }

  // Admission Officer items
  if (user?.role === 'admission_officer') {
    items.push(
      {
        title: "Manage Users",
        url: "/users",
        icon: Users,
        permission: "view_all_users"
      },
      {
        title: "All Applications",
        url: "/applications",
        icon: FileText,
        permission: "view_all_applications"
      },
      {
        title: "Quick Admission",
        url: "/quick-admission",
        icon: UserPlus,
        permission: "view_all_applications"
      },
      {
        title: "WhatsApp Portal",
        url: "/whatsapp",
        icon: MessageCircle,
        permission: "view_all_applications"
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
        permission: "view_analytics"
      },
      {
        title: "Add Staff",
        url: "/users/create",
        icon: UserPlus,
        permission: "create_department_staff"
      }
    );
  }

  // Department Staff items
  if (user?.role === 'department_staff') {
    items.push(
      {
        title: "My Applications",
        url: "/applications/department",
        icon: FileText,
        permission: "view_department_applications"
      },
      {
        title: "Department",
        url: "/department",
        icon: Building,
        permission: "view_department_applications"
      }
    );
  }

  return items;
};

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admission_officer':
      return 'Admission Officer';
    case 'department_staff':
      return 'Department Staff';
    default:
      return role;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Shield className="w-3 h-3" />;
    case 'admission_officer':
      return <UserPlus className="w-3 h-3" />;
    case 'department_staff':
      return <Building className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<StudentUser | null>(null);
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
