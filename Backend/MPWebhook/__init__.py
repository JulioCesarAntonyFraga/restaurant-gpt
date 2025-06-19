import logging
import azure.functions as func
import json
import os
from utils.storage import advance_order_status, get_order
from utils.message_sender import send_whatsapp_message

def format_order_message(order: dict) -> str:
    msg = f"📦 *Pedido #{order.get('id')}*\n"
    msg += f"👤 Cliente: {order.get('name')}\n"

    if order.get("is_delivery"):
        endereco = f"{order.get('rua', '')}, Nº {order.get('numero', '')}, "
        endereco += f"{order.get('bairro', '')}, {order.get('cidade', '')} - CEP: {order.get('cep', '')}"
        msg += f"🏠 Entrega: {endereco}\n"


    msg += f"\n🧾 *Itens do pedido:*\n"
    for item in order.get("items", []):
        name = item.get("name")
        quantity = item.get("quantity", 1)
        base_price = item.get("price", 0)

        # Toppings
        toppings = item.get("toppings", [])

        # Additionals
        additionals = item.get("additionals", [])
        additionals_total = sum(a.get("price", 0) for a in additionals)

        item_total = (base_price + additionals_total) * quantity

        msg += f"• {quantity}x {name} - R$ {item_total:.2f}\n"

        for topping in toppings:
            msg += f"   + {topping.get('name')}\n"

        for extra in additionals:
            msg += f"   + {extra.get('name')} (R$ {extra.get('price', 0):.2f})\n"

    msg += f"\n💰 Total: R$ {order.get('total', 0):.2f}\n"
    msg += f"💳 Pagamento: {order.get('payment_method')}\n"

    return msg


def main(req: func.HttpRequest) -> func.HttpResponse:
    secret = req.params.get("secret")
    expected_secret = os.getenv("MP_WEBHOOK_SECRET")

    if secret != expected_secret:
        return func.HttpResponse("Unauthorized", status_code=401)

    order_id = req.route_params.get("order_id")
    phone = req.params.get("phone")

    if not order_id or not phone:
        return func.HttpResponse("Missing order_id or phone number", status_code=400)

    try:
        order = advance_order_status(order_id)
        full_order = get_order(order_id)

        message = format_order_message(full_order)
        send_whatsapp_message(to_number=phone, body=message)

        return func.HttpResponse(json.dumps(order), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.error(f"Erro ao processar webhook: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
