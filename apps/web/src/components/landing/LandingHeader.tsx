import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import ThemeToggle from "#/components/ThemeToggle";
import { Button } from "#/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";
import { cn } from "#/lib/utils";
import type { User } from "better-auth";

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Planos", href: "#planos" },
] as const;

export function LandingHeader({
  className,
  user,
}: {
  className?: string;
  user?: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          Zentria
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-10 min-w-10 shrink-0 px-2 text-sm sm:min-w-0 sm:px-3"
                asChild
              >
                <Link to="/signin">Entrar</Link>
              </Button>
              <Button
                size="sm"
                className="min-h-10 min-w-10 shrink-0 px-2 text-sm sm:min-w-0 sm:px-3"
                asChild
              >
                <Link to="/signup">Começar</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-10 min-w-10 md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navLinks.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="text-muted-foreground hover:text-foreground block py-3 font-medium transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="outline" className="min-h-11 w-full" asChild>
                    <Link to="/signin" onClick={() => setOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button className="min-h-11 w-full" asChild>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Começar
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
