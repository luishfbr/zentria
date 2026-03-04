import { LoadingButton } from "#/components/loading-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field";
import { authClient } from "#/lib/auth-client";
import { signInSchema, type SignInType } from "#/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useNavigate } from "@tanstack/react-router";

export const AdminSignInForm = () => {
  const navigate = useNavigate();
  const form = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSignIn({ email, password }: SignInType) {
    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onError: (error) => {
          console.error(error);
          toast.error(error.error.message);
        },
        onSuccess: async () => {
          const verify = await authClient.getSession({
            query: {
              disableCookieCache: true,
            },
            fetchOptions: {
              onError: async ({ error }) => {
                toast.error(error.message || "Falha ao validar usuário.");
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      navigate({
                        to: "/",
                      });
                    },
                  },
                });
              },
            },
          });

          if (verify.data?.user.role !== "superadmin") {
            navigate({
              to: "/dashboard",
              replace: true,
              reloadDocument: true,
            });
          } else {
            toast.success(`Seja bem-vindo ${verify.data?.user.name}`);
            navigate({
              to: "/admin/dashboard",
              replace: true,
            });
          }
        },
      },
    });
  }
  return (
    <Card className="w-full md:max-w-100">
      <CardHeader>
        <CardTitle>Login de Administrador</CardTitle>
        <CardDescription>
          Informe suas credenciais nos campos abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="admin-signin" onSubmit={form.handleSubmit(handleSignIn)}>
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <LoadingButton
            form="admin-signin"
            disabled={form.formState.isSubmitting}
            loading={form.formState.isSubmitting}
            label="Entrar"
          />
        </Field>
      </CardFooter>
    </Card>
  );
};
