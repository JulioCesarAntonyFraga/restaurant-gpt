import requests
import json

def enviar_mensagem_whatsapp(token, phone_number_id, to_number, body, url_preview="", api_version="v18.0"):
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
        print("✅ Mensagem enviada com sucesso!")
    else:
        print(f"❌ Erro ao enviar mensagem: {response.status_code}")
        print(response.text)

    return response.json()


if __name__ == "__main__":
    enviar_mensagem_whatsapp(token="EAAJLDLsl6F8BO9D8nYyYLRD3kKCCMsIVEPLcivJaLIyLlfOu6Xovr0mjTvy4Nmk2eYJoMM9wRKlvtAKo3ZBZCPGTseESX1fhUHudDgLB1ZAMXHimUYSY0q5mJ1C9Usvc5sd24hZBU8mAAAWzT5sLs6Y6JfhF9VKZAGmMPT8iiyZCkCZCZAvVmrfUqCq0z60lRqOS3pfoANhLLv5kuzvOtWGJoSo7F24ZD",
        phone_number_id="549356544937574",  # Substitua pelo ID do número de telefone
        to_number="351913106820",  # Substitua pelo número de destino
        body="Julio do Python❤️" # Mensagem a ser enviada
    )