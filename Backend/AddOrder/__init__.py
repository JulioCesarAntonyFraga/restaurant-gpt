import azure.functions as func
import json
from firebase_admin import firestore
from utils.storage import save_order, get_menu

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
    
    required_fields = [
        "phone_number", "items", "name",
        "is_delivery", "payment_method"
    ]
    
    if "is_delivery" not in data:
        return func.HttpResponse(
            "is_delivery field is required", status_code=400
        )
    
    if data["is_delivery"] == True:
        required_fields.append("rua")
        required_fields.append("cep")
        required_fields.append("bairro")
        required_fields.append("numero")
        required_fields.append("cidade")

    for field in required_fields:
        if field not in data:
            return func.HttpResponse(f"Missing field: {field}", status_code=400)

    if data["payment_method"] not in payment_methods:
        return func.HttpResponse(
            f"Invalid payment method: {data['payment_method']}",
            status_code=400
        )

    items = data["items"]
    if not isinstance(items, list) or not items:
        return func.HttpResponse("Items must be a non-empty list", status_code=400)

    # Validar os itens com base no menu
    available_menu = get_menu(False)
    available_ids = {item["id"] for item in available_menu}

    items_required_fields = ["id", "quantity"]

    for filed in items_required_fields:
        for item in items:
            if filed not in item:
                return func.HttpResponse(
                    f"Missing field: {filed} in item {available_menu.get('name', '')}",
                    status_code=400
                )

    for item in items:
        if item["id"] not in available_ids:
            return func.HttpResponse(
                f"Item {item.get('name', '')} não está disponível ou não existe",
                status_code=400
            )

    for item in items:
        if item["quantity"] <= 0:
            return func.HttpResponse(
                f"Item {item.get('name', '')} deve ter quantidade maior que 0",
                status_code=400
            )

    total = 0

    for item in items:
        item_id = item["id"]
        item_quantity = item["quantity"]

        # Obter o preço do item do menu
        menu_item = next((menu_item for menu_item in available_menu if menu_item["id"] == item_id), None)
        if menu_item:
            item_price = menu_item["price"]
            total += item_price * item_quantity
        else:
            return func.HttpResponse(
                f"Item {item.get('name', '')} não encontrado no menu",
                status_code=400
            )

    try:
        save_order(
            name=data.get("name", ""),
            phone_number=data.get("phone_number", ""),
            items=items,
            total=float(total),
            is_delivery=bool(data.get("is_delivery", False)),
            cep=str(data.get("cep", "")),
            rua=str(data.get("rua", "")),
            bairro=str(data.get("bairro", "")),
            numero=str(data.get("numero", "")),
            cidade=str(data.get("cidade", "")),
            payment_method=data.get("payment_method", "")
        )
    except Exception as e:
        return func.HttpResponse(
            f"Erro ao salvar pedido: {str(e)}", status_code=500
        )

    return func.HttpResponse(
        json.dumps({"success": True, "message": "Pedido registrado com sucesso!"}),
        status_code=201,
        mimetype="application/json"
    )