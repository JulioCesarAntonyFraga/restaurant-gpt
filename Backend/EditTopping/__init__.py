import azure.functions as func
import json
import time
from firebase_admin import firestore
from utils.auth import verify_token

db = firestore.client()

required_fields = ["name", "available"]
optional_fields = ["description"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        topping = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    topping_id = topping.get("id")
    if not topping_id:
        return func.HttpResponse("Missing topping id", status_code=400)

    doc_ref = db.collection("toppings").document(topping_id)
    existing_doc = doc_ref.get()

    if not existing_doc.exists:
        return func.HttpResponse("topping not found", status_code=404)

    # Validação dos campos inteiros
    for field_name in ["max_toppings", "max_additionals"]:
        if field_name in topping:
            value = topping[field_name]
            if isinstance(value, str):
                if value.strip().isdigit():
                    topping[field_name] = int(value.strip())
                else:
                    return func.HttpResponse(f"'{field_name}' must be an integer", status_code=400)
            elif not isinstance(value, int):
                return func.HttpResponse(f"'{field_name}' must be an integer", status_code=400)

    existing_data = existing_doc.to_dict()
    updates = {}

    for field in required_fields + optional_fields:
        if field in topping and topping[field] != existing_data.get(field):
            updates[field] = topping[field]

    if updates:
        updates["updated_at"] = int(time.time())
        doc_ref.update(updates)
        updated_doc = doc_ref.get().to_dict()
        return func.HttpResponse(json.dumps(updated_doc), status_code=200, mimetype="application/json")
    else:
        return func.HttpResponse("No changes detected", status_code=200)
