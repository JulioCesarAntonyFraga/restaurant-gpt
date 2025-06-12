import azure.functions as func
import json
import time
from firebase_admin import firestore
from utils.auth import verify_token
from utils.storage import get_toppings, get_additionals

db = firestore.client()

required_fields = ["name", "price", "available", "category", "max_toppings", "max_additionals"]
optional_fields = ["description", "imageUrl"]
extra_fields = ["toppings", "additionals"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        menu_item = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    item_id = menu_item.get("id")
    if not item_id:
        return func.HttpResponse("Missing item id", status_code=400)

    doc_ref = db.collection("menu").document(item_id)
    existing_doc = doc_ref.get()

    if not existing_doc.exists:
        return func.HttpResponse("Menu item not found", status_code=404)

    existing_data = existing_doc.to_dict()
    updates = {}

    for field in required_fields + optional_fields + extra_fields:
        if field in menu_item and menu_item[field] != existing_data.get(field):
            updates[field] = menu_item[field]

    # Valida preço se foi alterado
    if "price" in updates:
        try:
            updates["price"] = float(updates["price"])
        except:
            return func.HttpResponse("Invalid price", status_code=400)

    # Validação toppings
    if "toppings" in updates:
        toppings = updates["toppings"]
        if not isinstance(toppings, list) or not all(isinstance(t, str) for t in toppings):
            return func.HttpResponse("Field 'toppings' must be a list of strings", status_code=400)
        if "max_toppings" not in updates and "max_toppings" not in menu_item and "max_toppings" not in existing_data:
            return func.HttpResponse("'max_toppings' is required when 'toppings' is provided", status_code=400)
        valid_topping_ids = {t["id"] for t in get_toppings()}
        for topping_id in toppings:
            if topping_id not in valid_topping_ids:
                return func.HttpResponse(f"Invalid topping ID: {topping_id}", status_code=400)

    # Validação additionals
    if "additionals" in updates:
        additionals = updates["additionals"]
        if not isinstance(additionals, list) or not all(isinstance(a, str) for a in additionals):
            return func.HttpResponse("Field 'additionals' must be a list of strings", status_code=400)
        if "max_additionals" not in updates and "max_additionals" not in menu_item and "max_additionals" not in existing_data:
            return func.HttpResponse("'max_additionals' is required when 'additionals' is provided", status_code=400)
        valid_additional_ids = {a["id"] for a in get_additionals()}
        for additional_id in additionals:
            if additional_id not in valid_additional_ids:
                return func.HttpResponse(f"Invalid additional ID: {additional_id}", status_code=400)

    if updates:
        updates["updated_at"] = int(time.time())
        doc_ref.update(updates)
        updated_doc = doc_ref.get().to_dict()
        return func.HttpResponse(json.dumps(updated_doc), status_code=200, mimetype="application/json")
    else:
        return func.HttpResponse("No changes detected", status_code=200)
