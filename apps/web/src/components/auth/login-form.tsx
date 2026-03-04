import { authClient } from "#/lib/auth-client";
import { signInSchema, type SignInType } from "#/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "../loading-components";

export function LoginForm() {
  const form = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function HandleSubmit({ email, password }: SignInType) {
    await authClient.signIn.email({
      email,
      password,
      callbackURL: "http://localhost:3000/dashboard",
      fetchOptions: {
        onSuccess: ({ response }) => {
          toast.success("Login realizado com sucesso!");
          console.log(response);
          form.reset();
        },
        onError: (error) => {
          if (error.error.status === 401) {
            toast.error(
              "Email ou senha inválidos! Por favor, tente novamente.",
            );
          } else {
            toast.error(error.error.message || "Falha ao realizar login!");
          }
        },
      },
    });
  }
  return (
    <form
      id="signin-form"
      className="p-4 md:p-6"
      onSubmit={form.handleSubmit(HandleSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-balance text-muted-foreground">
            Faça login em sua conta
          </p>
        </div>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field aria-disabled={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" placeholder="m@exemplo.com" {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field aria-disabled={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <a
                  href="/send-reset-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Esqueceu sua senha?
                </a>
              </div>
              <Input id="password" type="password" {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <LoadingButton
            form="signin-form"
            label="Entrar"
            loading={form.formState.isSubmitting}
            disabled={form.formState.disabled}
          />
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Ou continue com
        </FieldSeparator>
        <Field orientation={"responsive"}>
          <Button variant="destructive" type="button">
            <span>Entre com o Google</span>
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Não tem uma conta? <a href="/signup">Cadastre-se</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
