import logging
import requests
import os

token = os.getenv("WHATSAPP_API_TOKEN")
phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

def build_order_confirmation_template_params(order: dict) -> list:
    address = "Retirada no local"
    if order.get("is_delivery"):
        address = f"{order.get('rua', '')}, Nº {order.get('numero', '')}, "
        address += f"{order.get('bairro', '')}, {order.get('cidade', '')} - CEP: {order.get('cep', '')}"

    items_text = ""
    for item in order.get("items", []):
        name = item.get("name")
        quantity = item.get("quantity") or item.get("amount", 1)
        base_price = item.get("price", 0)
        toppings = item.get("toppings", [])
        additionals = item.get("additionals", [])
        additionals_total = sum(a.get("price", 0) for a in additionals)
        item_total = (base_price + additionals_total) * quantity

        line = f"{quantity}x {name} - R$ {item_total:.2f}"
        items_text += line + "; "

        for topping in toppings:
            items_text += f"+ {topping.get('name')}; "
        for extra in additionals:
            items_text += f"+ {extra.get('name')} (R$ {extra.get('price', 0):.2f}); "

    items_text = items_text.strip("; ")

    change = order.get("change", "0")

    return {
        "order_id": str(order.get("id", "")),
        "name": order.get("name", ""),
        "address": address,
        "items": items_text.strip(),
        "total": f"R$ {order.get('total', 0):.2f}",
        "payment_method": order.get("payment_method", ""),
        "change": str(change)
    }

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