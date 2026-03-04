import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldDescription } from "#/components/ui/field";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/(auth)/_pathlessLayout")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Button
                className="fixed m-2"
                size={"icon-sm"}
                variant={"ghost"}
                title="Voltar"
                onClick={() => navigate({ to: "/" })}
              >
                <ArrowLeft />
              </Button>
              <Outlet />
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/images/placeholder.png"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            Clicando em continuar, você concorda com nossos{" "}
            <a href="#">Termos de Serviço</a> e{" "}
            <a href="#">Política de Privacidade</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
