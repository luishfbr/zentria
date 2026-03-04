import { signUpSchema, type SignUpType } from "#/lib/validations";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "#/lib/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "../loading-components";

export function RegisterForm() {
  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });

  async function HandleSubmit({ email, name, password }: SignUpType) {
    await authClient.signUp.email({
      email,
      name,
      password,
      fetchOptions: {
        onSuccess: ({ response }) => {
          toast.success("Conta criada com sucesso!");
          console.log(response);
          form.reset();
        },
        onError: (error) => {
          if (error.error.status === 422) {
            toast.error("Usuário já existe! Por favor, tente outro email.");
          } else {
            toast.error(error.error.message || "Falha ao criar conta!");
          }
        },
      },
    });
  }

  return (
    <form
      id="signup-form"
      className="p-4 md:p-6"
      onSubmit={form.handleSubmit(HandleSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Seja bem-vindo!</h1>
          <p className="text-balance text-muted-foreground">
            Informe suas credenciais nos campos abaixos
          </p>
        </div>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field aria-disabled={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
              <Input id="name" placeholder="ex: John Doe..." {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input id="password" type="password" {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <LoadingButton
            form="signup-form"
            label="Registrar"
            loading={form.formState.isSubmitting}
            disabled={form.formState.disabled}
          />
        </Field>
        <FieldDescription className="text-center">
          <a href="/signin">Possuo uma conta e quero entrar...</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
