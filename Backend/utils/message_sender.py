import requests
import os

token = os.getenv("WHATSAPP_API_TOKEN")
phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

def send_whatsapp_message(to_number, body, url_preview="", api_version="v22.0"):
    url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {
            "preview_url": bool(url_preview),
            "body": body
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro ao enviar mensagem: {{'status_code': {response.status_code}, 'response': {response.text}}}")