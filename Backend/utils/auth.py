import firebase_admin
from firebase_admin import auth
import azure.functions as func

def verify_token(req: func.HttpRequest):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("Token inválido:", e)
        return None
