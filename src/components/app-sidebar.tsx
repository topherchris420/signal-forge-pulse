import { NavLink, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  Brain, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Shield,
  Activity,
  Zap
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { 
    title: "Overview", 
    url: "/", 
    icon: BarChart3,
    description: "Executive dashboard and metrics"
  },
  { 
    title: "Coherence Engine", 
    url: "/coherence", 
    icon: Brain,
    description: "Linguistic alignment analysis"
  },
  { 
    title: "Entropy Monitor", 
    url: "/entropy", 
    icon: TrendingUp,
    description: "Communication fragmentation detection"
  },
  { 
    title: "Warning System", 
    url: "/warnings", 
    icon: AlertTriangle,
    description: "Early alert management"
  },
  { 
    title: "System Health", 
    url: "/health", 
    icon: Activity,
    description: "Platform status and diagnostics"
  },
]

const settingsItems = [
  { 
    title: "Security", 
    url: "/security", 
    icon: Shield,
    description: "Access control and encryption"
  },
  { 
    title: "Configuration", 
    url: "/settings", 
    icon: Settings,
    description: "System preferences"
  },
  { 
    title: "API", 
    url: "/api", 
    icon: Zap,
    description: "Integration endpoints"
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors"
    return isActive(path) 
      ? `${baseClasses} bg-sidebar-accent text-sidebar-accent-foreground font-medium`
      : `${baseClasses} hover:bg-sidebar-accent/50`
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="px-2">
        {/* Logo and brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-signal-blue rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-sidebar-foreground">SignalVault</h1>
                <p className="text-xs text-sidebar-foreground/60">AI Organizational Analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="px-4 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
            Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClasses(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          <span className="text-xs text-sidebar-foreground/60">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Navigation */}
        <SidebarGroup className="px-0 mt-auto">
          <SidebarGroupLabel className="px-4 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClasses(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          <span className="text-xs text-sidebar-foreground/60">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}