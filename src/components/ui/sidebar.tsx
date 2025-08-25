import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  ChevronLeft,
  Compass,
  Radio,
  Coins,
  Gem,
  Plus,
  TrendingUp,
  FileText,
  Activity,
  HelpCircle,
  Menu
} from "lucide-react"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isCollapsed: boolean
}

function NavItem({ href, icon, title, isCollapsed }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "h-[calc(100vh-4rem)] sticky top-16 p-4 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-3">
          {isCollapsed ? (
            <Menu size={20} />
          ) : (
            <span className="text-lg font-semibold">Menu</span>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem
            href="/discovery"
            icon={<Compass size={20} />}
            title="Discovery"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/launch-channel"
            icon={<Radio size={20} />}
            title="Launch Channel"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/tokens"
            icon={<Coins size={20} />}
            title="Tokens"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/tokenize"
            icon={<Gem size={20} />}
            title="Tokenize"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/create-pad"
            icon={<Plus size={20} />}
            title="Create Pad"
            isCollapsed={isCollapsed}
          />
        </nav>

        <div className="flex flex-col gap-1">
          <div className="px-3 py-2">
            {!isCollapsed && (
              <span className="text-xs font-medium text-gray-400">TRENDING</span>
            )}
          </div>
          <NavItem
            href="/trending"
            icon={<TrendingUp size={20} />}
            title="Top Trending Channels"
            isCollapsed={isCollapsed}
          />
          {!isCollapsed && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No channels available
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <NavItem
            href="/docs"
            icon={<FileText size={20} />}
            title="Doc"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/activities"
            icon={<Activity size={20} />}
            title="Activities"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/faq"
            icon={<HelpCircle size={20} />}
            title="FAQ"
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  )
}
