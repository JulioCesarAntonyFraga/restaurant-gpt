import logging
import requests
import os

token = os.getenv("WHATSAPP_API_TOKEN")
phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

def send_template_message(to_number, template_name, lang_code, params_dict, api_version="v22.0"):
    url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Monta componentes com parameter_name conforme seu exemplo
    components = [
        {
            "type": "header",
            "parameters": [
                {
                    "type": "text",
                    "text": params_dict["order_id"],
                    "parameter_name": "order_id"
                }
            ]
        },
        {
            "type": "body",
            "parameters": [
                {
                    "type": "text",
                    "text": params_dict["name"],
                    "parameter_name": "name"
                },
                {
                    "type": "text",
                    "text": params_dict["address"],
                    "parameter_name": "address"
                },
                {
                    "type": "text",
                    "text": params_dict["items"],
                    "parameter_name": "items"
                },
                {
                    "type": "text",
                    "text": params_dict["total"],
                    "parameter_name": "total"
                },
                {
                    "type": "text",
                    "text": params_dict["payment_method"],
                    "parameter_name": "payment_method"
                },
                {
                    "type": "text",
                    "text": params_dict["change"],
                    "parameter_name": "change"
                },
            ]
        }
    ]

    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": lang_code
            },
            "components": components
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro ao enviar mensagem com template: {{'status_code': {response.status_code}, 'response': {response.text}}}")

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