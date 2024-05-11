from django.core.mail import EmailMessage
from cryptography.fernet import Fernet
import os
from django.core.exceptions import ImproperlyConfigured


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


class FileEncryption:

    def __init__(self):
        self.key = self._get_fernet_key()

    def _get_fernet_key(self):
        key = os.environ.get('FERNET_KEY')
        if not key:
            return ImproperlyConfigured("FERNET KEY, environment variable is not set.")
        return key

    def encrypt_file(self, file_path):
        f = Fernet(self.key)
        with open(file_path, 'rb') as file:
            file_data = file.read()
        encrypted_data = f.encrypt(file_data)

        with open(file_path, 'wb') as file:
            file.write(encrypted_data)
        return encrypted_data

    def decrypt_file(self, encrypted_data, output_file_path):
        f = Fernet(self.key)
        decrypted_data = f.decrypt(encrypted_data)

        with open(output_file_path, 'wb') as file:
            file.write(decrypted_data)
