import azure.functions as func
import json
from firebase_admin import firestore
from utils.storage import save_order, get_menu

db = firestore.client()

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON", status_code=400)

    required_fields = [
        "phone_number", "items", "total",
        "is_delivery", "address", "payment_method"
    ]
    for field in required_fields:
        if field not in data:
            return func.HttpResponse(f"Missing field: {field}", status_code=400)

    items = data["items"]
    if not isinstance(items, list) or not items:
        return func.HttpResponse("Items must be a non-empty list", status_code=400)

    # Validar os itens com base no menu
    available_menu = get_menu()
    available_ids = {item["id"] for item in available_menu}

    for item in items:
        if item["id"] not in available_ids:
            return func.HttpResponse(
                f"Item {item.get('name', '')} não está disponível ou não existe",
                status_code=400
            )

    try:
        save_order(
            phone_number=data["phone_number"],
            items=items,
            total=float(data["total"]),
            is_delivery=bool(data["is_delivery"]),
            address=data["address"],
            payment_method=data["payment_method"],
            change=float(data.get("change")) if data.get("change") else None
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
#trigger vercel test