"""
utils/email.py
--------------
Módulo de envío de correos SIMULADO.

En desarrollo imprime el correo en consola (con formato legible).
En producción reemplaza `_send` por una integración real:
  · SMTP nativo (smtplib)
  · SendGrid / Mailgun / AWS SES vía su SDK

Para activar SMTP real, descomenta la sección correspondiente
y agrega las variables MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD al .env.
"""
import logging
from config.settings import settings

logger = logging.getLogger("cinenova.email")


def _send(to: str, subject: str, body: str) -> None:
    """
    Envío real (descomenta para producción con SMTP):

    import smtplib
    from email.mime.text import MIMEText
    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"]    = settings.MAIL_FROM
    msg["To"]      = to
    with smtplib.SMTP_SSL(settings.MAIL_HOST, settings.MAIL_PORT) as server:
        server.login(settings.MAIL_USER, settings.MAIL_PASSWORD)
        server.send_message(msg)
    """
    # ── Simulación en consola ──────────────────────────────────────────────────
    separator = "─" * 60
    logger.info(
        "\n%s\n📧 CORREO SIMULADO\n  Para    : %s\n  De      : %s\n  Asunto  : %s\n%s\n%s\n%s",
        separator, to, settings.MAIL_FROM, subject, separator, body, separator,
    )
    print(
        f"\n{separator}\n📧 CORREO SIMULADO\n"
        f"  Para    : {to}\n"
        f"  De      : {settings.MAIL_FROM}\n"
        f"  Asunto  : {subject}\n"
        f"{separator}\n{body}\n{separator}\n"
    )


def send_reset_password_email(to: str, nombre: str, token: str) -> None:
    """Envía el enlace de restablecimiento de contraseña."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "CINENOVA – Restablece tu contraseña"
    body = f"""
    <h2>Hola, {nombre}!</h2>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>CINENOVA</strong>.</p>
    <p>Haz clic en el siguiente enlace (válido por {settings.RESET_TOKEN_EXPIRE_MINUTES} minutos):</p>
    <p><a href="{reset_url}" style="color:#DC2626;font-weight:bold">{reset_url}</a></p>
    <p>Si no solicitaste este cambio, ignora este correo. Tu contraseña actual permanecerá intacta.</p>
    <hr/>
    <small>CINENOVA · Sistema de Venta de Boletos</small>
    """
    _send(to=to, subject=subject, body=body)


def send_welcome_email(to: str, nombre: str) -> None:
    """Bienvenida al nuevo cliente registrado."""
    subject = "¡Bienvenido a CINENOVA!"
    body = f"""
    <h2>¡Hola, {nombre}!</h2>
    <p>Tu cuenta en <strong>CINENOVA</strong> fue creada exitosamente. 🎬</p>
    <p>Ya puedes iniciar sesión y comenzar a comprar boletos.</p>
    <p><a href="{settings.FRONTEND_URL}/login" style="color:#DC2626;font-weight:bold">Ir al inicio de sesión</a></p>
    <hr/>
    <small>CINENOVA · Sistema de Venta de Boletos</small>
    """
    _send(to=to, subject=subject, body=body)
