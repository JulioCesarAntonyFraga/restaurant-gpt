import logging
import azure.functions as func
import json
from firebase_admin import firestore
from utils.storage import save_order, get_menu, get_toppings, get_additionals
from mercadopago import SDK
import os

db = firestore.client()

payment_methods = {
    "credit_card": "Cartão de Crédito",
    "debit_card": "Cartão de Débito",
    "pix": "Pix",
    "cash": "Dinheiro"
}

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON", status_code=400)

    sdk = SDK(os.environ.get("MP_ACCESS_TOKEN"))

    # Campos obrigatórios
    required_fields = ["phone_number", "items", "name", "is_delivery", "payment_method"]

    if "is_delivery" not in data:
        return func.HttpResponse("is_delivery field is required", status_code=400)

    if data["is_delivery"] is True:
        required_fields += ["rua", "cep", "bairro", "numero", "cidade"]

    for field in required_fields:
        if field not in data:
            return func.HttpResponse(f"Missing field: {field}", status_code=400)

    if data["payment_method"] not in payment_methods:
        return func.HttpResponse(f"Invalid payment method: {data['payment_method']}", status_code=400)

    if not isinstance(data["items"], list) or not data["items"]:
        return func.HttpResponse("Items must be a non-empty list", status_code=400)

    # Dados do banco
    menu = get_menu(False)
    toppings_db = [t for t in get_toppings() if t["available"]]
    additionals_db = [a for a in get_additionals() if a["available"]]

    valid_item_ids = {i["id"]: i for i in menu}
    valid_topping_ids = {t["id"]: t for t in toppings_db}
    valid_additional_ids = {a["id"]: a for a in additionals_db}

    processed_items = []
    total = 0.0

    for item in data["items"]:
        if "id" not in item or "quantity" not in item:
            return func.HttpResponse("Each item must have 'id' and 'quantity'", status_code=400)

        item_id = item["id"]
        quantity = item["quantity"]
        observation = item["observation"]

        if item_id not in valid_item_ids:
            return func.HttpResponse(f"Item ID '{item_id}' is invalid or not available", status_code=400)
        if not isinstance(quantity, int) or quantity <= 0:
            return func.HttpResponse(f"Item '{item_id}' has invalid quantity", status_code=400)

        menu_item = valid_item_ids[item_id]
        item_total_price = menu_item["price"] * quantity

        toppings_input = item.get("toppings", [])
        additionals_input = item.get("additionals", [])

        max_toppings = menu_item.get("max_toppings", 99)
        max_additionals = menu_item.get("max_additionals", 99)

        if len(toppings_input) > max_toppings:
            return func.HttpResponse(
                f"O item '{menu_item['name']}' permite no máximo {max_toppings} toppings.",
                status_code=400
            )

        if len(additionals_input) > max_additionals:
            return func.HttpResponse(
                f"O item '{menu_item['name']}' permite no máximo {max_additionals} adicionais.",
                status_code=400
            )

        allowed_topping_ids = menu_item.get("toppings", [])
        allowed_additional_ids = menu_item.get("additionals", [])

        toppings = []
        for topping_id in toppings_input:
            if topping_id not in valid_topping_ids:
                return func.HttpResponse(f"Topping ID '{topping_id}' is inválido ou indisponível.", status_code=400)
            if topping_id not in allowed_topping_ids:
                return func.HttpResponse(f"Topping ID '{topping_id}' não é permitido para o item '{menu_item['name']}'", status_code=400)
            topping = valid_topping_ids[topping_id]
            toppings.append({"id": topping["id"], "name": topping["name"]})

        additionals = []
        for add_id in additionals_input:
            if add_id not in valid_additional_ids:
                return func.HttpResponse(f"Additional ID '{add_id}' é inválido ou indisponível.", status_code=400)
            if add_id not in allowed_additional_ids:
                return func.HttpResponse(f"Additional ID '{add_id}' não é permitido para o item '{menu_item['name']}'", status_code=400)
            additional = valid_additional_ids[add_id]
            additionals.append({
                "id": additional["id"],
                "name": additional["name"],
                "price": additional["price"]
            })
            item_total_price += additional["price"] * quantity


        processed_items.append({
            "id": item_id,
            "name": menu_item["name"],
            "price": menu_item["price"],
            "amount": quantity,
            "toppings": toppings,
            "additionals": additionals,
            "observation": observation
        })

        total += item_total_price

    # Preparar dados para salvar
    order_data = {
        "name": data["name"],
        "phone_number": data["phone_number"],
        "is_delivery": data["is_delivery"],
        "payment_method": data["payment_method"],
        "items": processed_items,
        "total": round(total, 2),
    }

    if data["is_delivery"]:
        order_data.update({
            "rua": data["rua"],
            "cep": data["cep"],
            "bairro": data["bairro"],
            "numero": data["numero"],
            "cidade": data["cidade"]
        })

        try:
            if data["payment_method"] in ["credit_card", "debit_card", "pix"]:
                order_data["status"] = "Pending"

            order = save_order(**order_data)
            MP_WEBHOOK_SECRET = os.environ.get("MP_WEBHOOK_SECRET")

            # Verifica se é pagamento online (usa Mercado Pago)
            if data["payment_method"] in ["credit_card", "debit_card", "pix"]:
                preference_data = {
                    "items": [
                        {
                            "title": item["name"],
                            "quantity": item["amount"],
                            "currency_id": "BRL",
                            "unit_price": round(item["price"] + sum(add["price"] for add in item["additionals"]), 2)
                        }
                        for item in processed_items
                    ],
                    "notification_url": f"https://restaurant-gpt.azurewebsites.net/api/mp-webhook/{order.get("id", "")}?secret={MP_WEBHOOK_SECRET}&&phone={order_data.get("phone_number", "")}",
                    "external_reference": order.get("id", ""),
                    "payer": {
                        "name": data["name"],
                    },
                    "back_urls": {
                        "success": "https://seuapp.com/pedido-sucesso",
                        "failure": "https://seuapp.com/pedido-falhou",
                        "pending": "https://seuapp.com/pedido-pendente"
                    },
                    "auto_return": "approved"
                }


                preference_response = sdk.preference().create(preference_data)

                # Verifica e loga erro do SDK
                if preference_response["status"] >= 400:
                    logging.error("Erro ao criar preferência no Mercado Pago:")
                    logging.error(json.dumps(preference_response, indent=2))
                    return func.HttpResponse(
                        json.dumps({
                            "success": False,
                            "message": "Erro ao criar preferência de pagamento.",
                            "details": preference_response["response"]
                        }),
                        status_code=500,
                        mimetype="application/json"
                    )

                preference = preference_response["response"]
                payment_url = preference.get("init_point") or preference.get("sandbox_init_point")
            else:
                # Pagamento offline (ex: dinheiro) não precisa de link
                payment_url = None

            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": "Pedido registrado com sucesso!",
                    "payment_url": payment_url,
                    "order_id": order.get("id", ""),
                }),
                status_code=201,
                mimetype="application/json"
            )

        except Exception as e:
            logging.exception("Erro ao processar pedido:")
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": f"Erro ao salvar pedido: {str(e)}"
                }),
                status_code=500,
                mimetype="application/json"
            )



