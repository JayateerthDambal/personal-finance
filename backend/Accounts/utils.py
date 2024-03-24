from django.core.mail import EmailMessage
from cryptography.fernet import Fernet
import os


class Util:
    @staticmethod
    def send_mail(data):
        email = EmailMessage(
            subject=data["email_subject"],
            body=data["email_body"],
            from_email=os.environ.get("EMAIL_FROM"),
            to=[data["email_address"]]
        )
        email.send()

    @staticmethod
    def load_encryption_key():
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
            raise ValueError("Missing ENCRYPTION_KEY in environment variables")
        return key

    @staticmethod
    def encrypt_token(token):
        key = Util.load_encryption_key()
        fernet = Fernet(key)
        return fernet.encrypt(token.encode()).decode()

    @staticmethod
    def decrypt_token(encrypted_token):
        key = Util.load_encryption_key()
        fernet = Fernet(key)
        return fernet.decrypt(encrypted_token.encode()).decode()
