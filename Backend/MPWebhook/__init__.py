import logging
import azure.functions as func
import json
import os
import requests
from utils.storage import advance_order_status, get_order
from utils.message_sender import build_order_confirmation_template_params, send_template_message
import hashlib
import hmac
import os
import logging
import urllib.parse

def verify_mp_signature(req) -> bool:
    try:
        x_signature = req.headers.get("x-signature")
        x_request_id = req.headers.get("x-request-id")
        if not x_signature or not x_request_id:
            logging.warning("Faltando headers obrigatórios.")
            return False

        # Extrair ts e v1
        parts = dict(part.strip().split("=", 1) for part in x_signature.split(",") if "=" in part)
        ts = parts.get("ts")
        v1 = parts.get("v1")

        if not ts or not v1:
            logging.warning("x-signature mal formatado.")
            return False

        # Extrair data.id da query string
        parsed_url = urllib.parse.urlparse(req.url)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        data_id = query_params.get("data.id", [None])[0]
        logging.info(f"Query parameters recebidos: {query_params}")

        # Se não veio na query, tenta do body
        if not data_id:
            try:
                body = req.get_json()
                logging.info(f"Body recebido: {body}")
                data_id = body.get("data", {}).get("id")
            except Exception as e:
                logging.warning(f"Erro ao tentar extrair data.id do body: {e}")
                data_id = None

        if not data_id:
            logging.warning("data.id não encontrado.")
            return False

        # Criar manifest string EXATAMENTE como Mercado Pago espera
        manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"

        # Comparar assinatura
        secret = os.getenv("MP_WEBHOOK_SECRET")  # Defina isso no Azure
        if not secret:
            logging.error("Chave secreta do Mercado Pago não configurada.")
            return False

        computed_hash = hmac.new(secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()

        return hmac.compare_digest(computed_hash, v1)

    except Exception as e:
        logging.error(f"Erro na verificação da assinatura: {e}")
        return False

def main(req: func.HttpRequest) -> func.HttpResponse:
    if not verify_mp_signature(req):
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        body = req.get_json()
        topic = body.get("type") or body.get("topic")  # pode ser "payment"
        data_id = body.get("data", {}).get("id")  # este é o payment_id

        if topic != "payment" or not data_id:
            return func.HttpResponse("Ignored", status_code=200)

        # Buscar detalhes do pagamento no Mercado Pago
        mp_token = os.getenv("MP_ACCESS_TOKEN")
        headers = {
            "Authorization": f"Bearer {mp_token}"
        }

        payment_info = requests.get(
            f"https://api.mercadopago.com/v1/payments/{data_id}",
            headers=headers
        ).json()

        logging.info(f"Pagamento recebido: {payment_info}")

        # Verifica se o pagamento está aprovado
        if payment_info.get("status") != "approved":
            logging.info(f"Pagamento {data_id} não aprovado. Status: {payment_info.get('status')} Message: {payment_info.get('message')}")
            return func.HttpResponse("Pagamento não aprovado", status_code=200)

        # Recupera order_id do external_reference
        order_id = payment_info.get("external_reference")
        if not order_id:
            return func.HttpResponse("external_reference ausente", status_code=400)

        # Avança status e envia mensagem
        order = advance_order_status(order_id)
        full_order = get_order(order_id)

        template_name = "order_confirmation"
        lang_code = "pt_BR"
        params_dict = build_order_confirmation_template_params(full_order)

        send_template_message(
            to_number=order.get("phone_number"),
            template_name=template_name,
            lang_code=lang_code,
            params_dict=params_dict
        )

        return func.HttpResponse(json.dumps(order), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.error(f"Erro ao processar webhook: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
