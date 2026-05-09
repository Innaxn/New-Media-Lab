import smtplib
from datetime import datetime
import os
from email.mime.text import MIMEText


def send_email(body="some body"):
    current_date = datetime.now().strftime("%Y-%m-%d")
    subject = f"Password game verification - {current_date}"
    sender = os.getenv("GMAIL_SENDER")
    password = os.getenv("GMAIL_PASSWORD")
    recipients = os.getenv("RECIPIENTS").split(',')
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, recipients, msg.as_string())
    print("Message sent!")