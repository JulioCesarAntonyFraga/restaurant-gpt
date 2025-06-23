import logging
import azure.functions as func
import json
import os
from utils.storage import advance_order_status, get_order
from utils.message_sender import send_template_message  # trocado aqui

def build_template_params(order: dict) -> list:
    # Monta endereço completo
    address = "Retirada no local"
    if order.get("is_delivery"):
        address = f"{order.get('rua', '')}, Nº {order.get('numero', '')}, "
        address += f"{order.get('bairro', '')}, {order.get('cidade', '')} - CEP: {order.get('cep', '')}"

    # Monta a descrição dos itens
    items_text = ""
    for item in order.get("items", []):
        name = item.get("name")
        quantity = item.get("quantity", 1)
        base_price = item.get("price", 0)
        toppings = item.get("toppings", [])
        additionals = item.get("additionals", [])
        additionals_total = sum(a.get("price", 0) for a in additionals)
        item_total = (base_price + additionals_total) * quantity

        line = f"{quantity}x {name} - R$ {item_total:.2f}"
        items_text += line + "\n"

        for topping in toppings:
            items_text += f"  + {topping.get('name')}\n"
        for extra in additionals:
            items_text += f"  + {extra.get('name')} (R$ {extra.get('price', 0):.2f})\n"

    # Se não tiver troco definido, default para "0"
    change = order.get("troco", "0")

    return [
        str(order.get("id", "")),
        order.get("name", ""),
        address,
        items_text.strip(),
        f"R$ {order.get('total', 0):.2f}",
        order.get("payment_method", ""),
        str(change)
    ]

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

        # Define nome e idioma do template
        template_name = "order_confirmation"
        lang_code = "pt_BR"

        params = build_template_params(full_order)

        send_template_message(
            to_number=phone,
            template_name=template_name,
            lang_code=lang_code,
            params=params
        )

        return func.HttpResponse(json.dumps(order), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.error(f"Erro ao processar webhook: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
