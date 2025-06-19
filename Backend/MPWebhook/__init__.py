import os
import logging
import azure.functions as func
import json
from utils.storage import advance_order_status

MP_WEBHOOK_SECRET = os.environ.get("MP_WEBHOOK_SECRET", "segredo123")

def main(req: func.HttpRequest) -> func.HttpResponse:
    secret = req.params.get("secret")
    if secret != MP_WEBHOOK_SECRET:
        return func.HttpResponse("Forbidden", status_code=403)

    order_id = req.route_params.get("order_id")
    if not order_id:
        return func.HttpResponse("Missing order_id", status_code=400)

    try:
        order = advance_order_status(order_id)
        return func.HttpResponse(json.dumps(order), mimetype="application/json", status_code=200)
    except Exception as e:
        logging.error(f"Erro ao avançar pedido {order_id}: {e}")
        return func.HttpResponse("Internal Server Error", status_code=500)
