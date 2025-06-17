import azure.functions as func
import json
from firebase_admin import firestore
from utils.storage import save_order, get_menu, get_toppings, get_additionals
from mercadopago import SDK

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

    sdk = SDK("YOUR_ACCESS_TOKEN")

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

        toppings = []
        for topping_id in item.get("toppings", []):
            if topping_id not in valid_topping_ids:
                return func.HttpResponse(f"Topping ID '{topping_id}' is invalid or not available", status_code=400)
            topping = valid_topping_ids[topping_id]
            toppings.append({"id": topping["id"], "name": topping["name"]})

        additionals = []
        for add_id in item.get("additionals", []):
            if add_id not in valid_additional_ids:
                return func.HttpResponse(f"Additional ID '{add_id}' is invalid or not available", status_code=400)
            additional = valid_additional_ids[add_id]
            additionals.append({"id": additional["id"], "name": additional["name"], "price": additional["price"]})
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
        order = save_order(**order_data)

        preference_data = {
            "items": [
                {
                    "title": "Pedido de João",
                    "quantity": 1,
                    "currency_id": "BRL",
                    "unit_price": total  # já calculado
                }
            ],
            "notification_url": "https://<sua-funcao-azure>.azurewebsites.net/api/payment-webhook",
            "external_reference": order.get("id", ""),  # precisa retornar esse ID de save_order()
            "payer": {
                "name": data["name"],
                "email": "fake@example.com"  # ou algo fixo se não tiver email
            }
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Pedido registrado com sucesso!",
                "payment_url": preference["init_point"],
                "order_id": order.get("id", ""),
            }),
            status_code=201,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(f"Erro ao salvar pedido: {str(e)}", status_code=500)


