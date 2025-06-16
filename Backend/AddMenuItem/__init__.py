import json
from utils.storage import add_menu_item, get_toppings, get_additionals
import azure.functions as func
from utils.auth import verify_token

required_fields = ["name", "price", "available", "category"]
optional_fields = ["description", "imageUrl", "toppings", "additionals", "max_toppings", "max_additionals"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        menu_item = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    # Verifica se existem campos inválidos
    for key in menu_item:
        if key not in required_fields and key not in optional_fields:
            return func.HttpResponse(f"Invalid field: {key}", status_code=400)

    # Verifica campos obrigatórios
    for field in required_fields:
        if field not in menu_item or (not menu_item[field] and menu_item[field] != 0):
            return func.HttpResponse(f"Missing field: {field}", status_code=400)

    # Verifica toppings e additionals
    if "toppings" in menu_item:
        toppings = menu_item["toppings"]
        if not isinstance(toppings, list) or not all(isinstance(t, str) for t in toppings):
            return func.HttpResponse("Field 'toppings' must be a list of strings", status_code=400)
        
        if "max_toppings" not in menu_item:
            return func.HttpResponse("'max_toppings' is required when 'toppings' is provided", status_code=400)
        
        max_toppings = menu_item["max_toppings"]
        if isinstance(max_toppings, str):
            if max_toppings.isdigit():
                menu_item["max_toppings"] = int(max_toppings)
            else:
                return func.HttpResponse("'max_toppings' must be an integer", status_code=400)
        elif not isinstance(max_toppings, int):
            return func.HttpResponse("'max_toppings' must be an integer", status_code=400)

        valid_toppings_ids = {t["id"] for t in get_toppings()}
        for topping_id in toppings:
            if topping_id not in valid_toppings_ids:
                return func.HttpResponse(f"Invalid topping ID: {topping_id}", status_code=400)

    if "additionals" in menu_item:
        additionals = menu_item["additionals"]
        if not isinstance(additionals, list) or not all(isinstance(a, str) for a in additionals):
            return func.HttpResponse("Field 'additionals' must be a list of strings", status_code=400)

        if "max_additionals" not in menu_item:
            return func.HttpResponse("'max_additionals' is required when 'additionals' is provided", status_code=400)

        max_additionals = menu_item["max_additionals"]
        if isinstance(max_additionals, str):
            if max_additionals.isdigit():
                menu_item["max_additionals"] = int(max_additionals)
            else:
                return func.HttpResponse("'max_additionals' must be an integer", status_code=400)
        elif not isinstance(max_additionals, int):
            return func.HttpResponse("'max_additionals' must be an integer", status_code=400)

        valid_additional_ids = {a["id"] for a in get_additionals()}
        for additional_id in additionals:
            if additional_id not in valid_additional_ids:
                return func.HttpResponse(f"Invalid additional ID: {additional_id}", status_code=400)


    return func.HttpResponse(
        json.dumps(add_menu_item(menu_item)),
        status_code=200,
        mimetype="application/json"
    )
