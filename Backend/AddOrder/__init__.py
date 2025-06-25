import logging
import azure.functions as func
import json
import os
from firebase_admin import firestore
from utils.message_sender import build_order_confirmation_template_params, send_template_message
from utils.storage import save_order, get_menu, get_toppings, get_additionals
from mercadopago import SDK

db = firestore.client()
payment_methods = ["online", "on_pickup", "cash_on_delivery"]


def validate_order_data(data):
    required_fields = ["phone_number", "items", "name", "is_delivery", "payment_method"]

    if "is_delivery" not in data:
        raise ValueError("is_delivery field is required")

    if data["is_delivery"]:
        required_fields += ["rua", "cep", "bairro", "numero", "cidade"]

    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing field: {field}")
        
    if data["payment_method"] not in payment_methods:
        raise ValueError(f"Invalid payment method: {data['payment_method']}")

    if not isinstance(data["items"], list) or not data["items"]:
        raise ValueError("Items must be a non-empty list")

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
            raise ValueError("Each item must have 'id' and 'quantity'")

        item_id = item["id"]
        quantity = item["quantity"]
        observation = item.get("observation", "")

        if item_id not in valid_item_ids:
            raise ValueError(f"Item ID '{item_id}' is invalid or not available")
        if not isinstance(quantity, int) or quantity <= 0:
            raise ValueError(f"Item '{item_id}' has invalid quantity")

        menu_item = valid_item_ids[item_id]
        item_total_price = menu_item["price"] * quantity

        toppings_input = item.get("toppings", [])
        additionals_input = item.get("additionals", [])

        if len(toppings_input) > menu_item.get("max_toppings", 99):
            raise ValueError(f"O item '{menu_item['name']}' permite no máximo {menu_item.get('max_toppings', 99)} toppings.")
        if len(additionals_input) > menu_item.get("max_additionals", 99):
            raise ValueError(f"O item '{menu_item['name']}' permite no máximo {menu_item.get('max_additionals', 99)} adicionais.")

        allowed_topping_ids = menu_item.get("toppings", [])
        allowed_additional_ids = menu_item.get("additionals", [])

        toppings = []
        for topping_id in toppings_input:
            if topping_id not in valid_topping_ids or topping_id not in allowed_topping_ids:
                raise ValueError(f"Topping ID '{topping_id}' inválido ou não permitido para o item '{menu_item['name']}'")
            topping = valid_topping_ids[topping_id]
            toppings.append({"id": topping["id"], "name": topping["name"]})

        additionals = []
        for add_id in additionals_input:
            if add_id not in valid_additional_ids or add_id not in allowed_additional_ids:
                raise ValueError(f"Additional ID '{add_id}' inválido ou não permitido para o item '{menu_item['name']}'")
            additional = valid_additional_ids[add_id]
            additionals.append({
                "id": additional["id"],
                "name": additional["name"],
                "price": additional["price"]
            })
            item_total_price += additional["price"]

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

    return processed_items, round(total, 2)


def create_payment_preference(sdk, order, items, name):
    preference_data = {
        "items": [
            {
                "title": item["name"],
                "quantity": item["amount"],
                "currency_id": "BRL",
                "unit_price": round(item["price"] + sum(add["price"] for add in item["additionals"]), 2)
            }
            for item in items
        ],
        "external_reference": order.get("id", ""),
        "payer": {
            "name": name,
        },
        "back_urls": {
            "success": "https://seuapp.com/pedido-sucesso",
            "failure": "https://seuapp.com/pedido-falhou",
            "pending": "https://seuapp.com/pedido-pendente"
        },
        "auto_return": "approved",
        "payment_methods": {
            "excluded_payment_types": [
                {"id": "ticket"},
                {"id": "atm"},
                {"id": "bank_transfer"},
                {"id": "crypto_transfer"},
            ],
            "excluded_payment_methods": [],
            "installments": 1
        },
    }

    preference_response = sdk.preference().create(preference_data)

    if preference_response["status"] >= 400:
        raise RuntimeError(json.dumps(preference_response["response"], indent=2))

    preference = preference_response["response"]
    return preference.get("init_point") or preference.get("sandbox_init_point")


def assemble_order_object(data, processed_items, total):
    order_data = {
        "name": data["name"],
        "phone_number": data["phone_number"],
        "is_delivery": data["is_delivery"],
        "payment_method": data["payment_method"],
        "items": processed_items,
        "change_to": data.get("change_to", None),
        "total": total,
        "status": 0
    }

    if data["is_delivery"]:
        order_data.update({
            "rua": data["rua"],
            "cep": data["cep"],
            "bairro": data["bairro"],
            "numero": data["numero"],
            "cidade": data["cidade"]
        })

    return order_data


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON", status_code=400)

    sdk = SDK(os.environ.get("MP_ACCESS_TOKEN"))

    try:
        processed_items, total = validate_order_data(data)
        order_data = assemble_order_object(data, processed_items, total)

        if data["payment_method"] == "online":
            order = save_order(**order_data)
            payment_url = create_payment_preference(sdk, order, processed_items, data["name"])
        else:
            order_data["status"] = 1
            order = save_order(**order_data)
            order_data = order.copy()
            payment_url = None

            template_name = "order_confirmation"
            lang_code = "pt_BR"
            params_dict = build_order_confirmation_template_params(order)

            send_template_message(
                to_number=order.get("phone_number"),
                template_name=template_name,
                lang_code=lang_code,
                params_dict=params_dict
            )

        return func.HttpResponse(
            json.dumps({
                "payment_url": payment_url,
                "order": order_data,
            }),
            status_code=201,
            mimetype="application/json"
        )

    except ValueError as ve:
        return func.HttpResponse(str(ve), status_code=400)
    except RuntimeError as re:
        logging.error("Erro ao criar preferência de pagamento:")
        logging.error(str(re))
        return func.HttpResponse(
            f"Erro ao criar preferência de pagamento: {str(re)}",
            status_code=500,
            mimetype="application/json"
        )
    except Exception as e:
        logging.exception("Erro ao processar pedido:")
        return func.HttpResponse(
            f"Erro ao salvar pedido: {str(e)}",
            status_code=500,
            mimetype="application/json"
        )
