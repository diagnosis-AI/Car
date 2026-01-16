import { Link, useLocation } from "wouter";
import { Car, History, Activity } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "فحص جديد", icon: Car },
    { href: "/history", label: "السجل", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
            <Activity className="size-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            طبيبي <span className="text-primary">السيارات</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
