import { authClient } from "#/lib/auth-client";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "../loading-components";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const sendResetPasswordSchema = z.object({
  email: z.email(),
});

export function SendResetPasswordForm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof sendResetPasswordSchema>>({
    resolver: zodResolver(sendResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function HandleSubmit({
    email,
  }: z.infer<typeof sendResetPasswordSchema>) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: "http://localhost:3000/reset-password",
      fetchOptions: {
        onSuccess: () => {
          toast.success("Email de redefinição de senha enviado com sucesso!");
          form.reset();
        },
        onError: (error) => {
          if (error.error.status === 422) {
            toast.error("Email inválido! Por favor, tente novamente.");
          } else {
            toast.error(
              error.error.message ||
                "Falha ao enviar email de redefinição de senha!",
            );
          }
        },
      },
    });
  }
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-sm md:max-w-125">
        <CardHeader>
          <CardTitle>Redefinição de senha</CardTitle>
          <CardDescription>
            {" "}
            Digite seu email para receber um link de redefinição de senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="send-reset-password-form"
            className="p-4 md:p-6"
            onSubmit={form.handleSubmit(HandleSubmit)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field aria-disabled={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" placeholder="m@exemplo.com" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <LoadingButton
                  form="send-reset-password-form"
                  label="Enviar link de redefinição de senha"
                  loading={form.formState.isSubmitting}
                  disabled={form.formState.disabled}
                />
                <Button
                  size={"sm"}
                  variant={"link"}
                  onClick={() => navigate({ to: "/signin" })}
                >
                  <ArrowLeft />
                  Retornar à página de login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
