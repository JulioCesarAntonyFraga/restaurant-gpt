import logging
import azure.functions as func
import requests
import json
import logging
import azure.functions as func
import json
import requests

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
        logging.info("✅ Mensagem enviada com sucesso!")
    else:
        logging.error(f"❌ Erro ao enviar mensagem: {response.status_code}")
        logging.error(response.text)

    return response.json()


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Recebida uma requisição HTTP.')

    try:
        req_body = req.get_json()
        
        message = req_body.get("message")
        to_number = req_body.get("to_number")  # Ex: "5511999999999"
        
        # Configuração do WhatsApp API (idealmente você pegaria do Azure App Settings)
        token = req_body.get("token")
        phone_number_id = req_body.get("phone_number_id")

        if not (to_number and token and phone_number_id):
            raise ValueError("Parâmetros obrigatórios faltando (to_number, token ou phone_number_id)")

        # Colocar resposta do chatGPT aqui para enviar de volta ao cliente
        resposta = f"Você disse: {message}"

        # Envia a mensagem via WhatsApp
        resultado_envio = enviar_mensagem_whatsapp(token, phone_number_id, to_number, message)

        return func.HttpResponse(
            json.dumps({
                "sucesso": True,
                "resposta": resposta,
                "whatsapp_result": resultado_envio
            }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Erro: {str(e)}")
        return func.HttpResponse(
            json.dumps({"erro": str(e)}),
            status_code=400,
            mimetype="application/json"
        )
