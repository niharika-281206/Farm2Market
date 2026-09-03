import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import secrets

def generate_email_otp() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(6))

def send_verification_email(to_email: str, code: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP settings are not fully configured.")
        return False
        
    subject = "Verify Your Email - Smart Procurement Centre"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 40px 20px;
                color: #2d3748;
            }}
            .email-container {{
                max-width: 500px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            }}
            .email-header {{
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 30px 20px;
                text-align: center;
            }}
            .email-header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }}
            .email-body {{
                padding: 40px 30px;
                text-align: center;
            }}
            .email-body p {{
                font-size: 16px;
                line-height: 1.6;
                color: #4a5568;
                margin: 0 0 20px 0;
            }}
            .otp-code {{
                display: inline-block;
                background: #f8fafc;
                border: 2px dashed #cbd5e1;
                border-radius: 8px;
                padding: 15px 30px;
                font-size: 32px;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: 8px;
                margin: 20px 0 30px 0;
            }}
            .email-footer {{
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }}
            .email-footer p {{
                font-size: 13px;
                color: #94a3b8;
                margin: 0;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Farm2Market Portal</h1>
            </div>
            <div class="email-body">
                <p>Hello,</p>
                <p>We received a request to access your administrative account. Please use the secure verification code below to proceed.</p>
                <div class="otp-code">{code}</div>
                <p>This code is highly sensitive and will securely expire in exactly <strong>5 minutes</strong>.</p>
                <p style="font-size: 14px; color: #718096; margin-top: 30px;">If you did not request this login, please ignore this email or contact security immediately.</p>
            </div>
            <div class="email-footer">
                <p>Farm2Market • Digital Agriculture Infrastructure System</p>
                <p>&copy; 2026 Ministry of Agriculture & Farmer Welfare</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg['To'] = to_email
    
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        # Establish a secure session with gmail's outgoing SMTP server using your account
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_operator_approval_email(to_email: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP settings are not fully configured.")
        return False
        
    subject = "Account Approved - Farm2Market"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 40px 20px;
                color: #2d3748;
            }}
            .email-container {{
                max-width: 500px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            }}
            .email-header {{
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 30px 20px;
                text-align: center;
            }}
            .email-header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }}
            .email-body {{
                padding: 40px 30px;
                text-align: center;
            }}
            .email-body p {{
                font-size: 16px;
                line-height: 1.6;
                color: #4a5568;
                margin: 0 0 20px 0;
            }}
            .success-icon {{
                font-size: 48px;
                margin-bottom: 20px;
            }}
            .email-footer {{
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }}
            .email-footer p {{
                font-size: 13px;
                color: #94a3b8;
                margin: 0;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Farm2Market Portal</h1>
            </div>
            <div class="email-body">
                <div class="success-icon">✅</div>
                <p>Hello,</p>
                <p>Great news! Your Operator account has been <strong>approved</strong> by the Administrator.</p>
                <p>You can now log in to the Operator Portal using your registered email address and password to start managing procurement operations.</p>
            </div>
            <div class="email-footer">
                <p>Farm2Market • Digital Agriculture Infrastructure System</p>
                <p>&copy; 2026 Ministry of Agriculture & Farmer Welfare</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg['To'] = to_email
    
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send approval email: {e}")
        return False
