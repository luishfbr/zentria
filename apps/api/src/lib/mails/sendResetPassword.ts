import { env } from "../env";
import { transporter } from "../transporter";

export async function SendResetPassword({ email, url }: { email: string, url: string }) {
    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Redefinir sua senha - Zentria",
        html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #18181b; letter-spacing: -0.02em;">Zentria</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: #71717a;">Redefinição de senha</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #3f3f46;">Olá,</p>
              <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #3f3f46;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #18181b;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none;">Redefinir senha</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 0; font-size: 13px; line-height: 1.6; color: #71717a;">Se você não solicitou essa alteração, ignore este e-mail. Sua senha permanecerá a mesma.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">Obrigado por usar o Zentria.<br>Equipe Zentria</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    });
}