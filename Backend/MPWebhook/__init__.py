import logging
import azure.functions as func
import json
import os
import requests
from utils.storage import advance_order_status, get_order
from utils.message_sender import send_template_message
import hashlib
import hmac
import logging
import os
import urllib.parse

def verify_mp_signature(req) -> bool:
    try:
        # Cabeçalhos
        x_signature = req.headers.get("x-signature")
        x_request_id = req.headers.get("x-request-id")

        if not x_signature or not x_request_id:
            return False

        # Extrai data.id da query string
        url = req.url
        query_params = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
        data_id = query_params.get("data.id", [""])[0]

        # Extrai ts e v1 do header
        parts = x_signature.split(",")
        ts, hash_v1 = None, None
        for part in parts:
            if "=" in part:
                key, value = part.split("=", 1)
                key, value = key.strip(), value.strip()
                if key == "ts":
                    ts = value
                elif key == "v1":
                    hash_v1 = value

        if not (ts and hash_v1 and data_id):
            return False

        # Monta manifest string
        manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"

        # Chave secreta (defina no Azure)
        secret = os.getenv("MP_WEBHOOK_SIGNATURE_SECRET")

        # Calcula HMAC-SHA256
        digest = hmac.new(secret.encode(), msg=manifest.encode(), digestmod=hashlib.sha256).hexdigest()

        return hmac.compare_digest(digest, hash_v1)

    except Exception as e:
        logging.error(f"Erro ao verificar assinatura: {e}")
        return False


def build_template_params(order: dict) -> list:
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
            logging.info(f"Pagamento {data_id} não aprovado. Status: {payment_info.get('status')}")
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
        params_dict = build_template_params(full_order)

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
