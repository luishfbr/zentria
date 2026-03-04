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
import { passwordSchema } from "#/lib/validations";

const newPasswordSchema = z.object({
  password: passwordSchema,
});

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  async function HandleSubmit({ password }: z.infer<typeof newPasswordSchema>) {
    await authClient.resetPassword({
      newPassword: password,
      token,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Senha redefinida com sucesso!");
          form.reset();
          navigate({ to: "/signin", replace: true });
        },
        onError: (error) => {
          if (error.error.status === 400) {
            toast.error(
              error.error.message ||
                "Token inválido! Por favor, tente novamente.",
            );
            navigate({ to: "/send-reset-password", replace: true });
          } else {
            toast.error(
              "Falha ao redefinir senha! Por favor, tente novamente.",
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
            Digite sua nova senha no campo abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="reset-password-form"
            className="p-4 md:p-6"
            onSubmit={form.handleSubmit(HandleSubmit)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field aria-disabled={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input id="password" type="password" {...field} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <LoadingButton
                  form="reset-password-form"
                  label="Redefinir senha"
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
