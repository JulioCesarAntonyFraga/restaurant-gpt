import azure.functions as func
import json
import time
from firebase_admin import firestore
from utils.auth import verify_token

db = firestore.client()

required_fields = ["name", "price", "available", "category"]
optional_fields = ["description", "imageUrl"]

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

    for field in required_fields + optional_fields:
        if field in menu_item and menu_item[field] != existing_data.get(field):
            updates[field] = menu_item[field]

    if "price" in updates:
        try:
            updates["price"] = float(updates["price"])
        except:
            return func.HttpResponse("Invalid price", status_code=400)

    if updates:
        updates["updated_at"] = int(time.time())
        doc_ref.update(updates)
        updated_doc = doc_ref.get().to_dict()
        return func.HttpResponse(json.dumps(updated_doc), status_code=200, mimetype="application/json")
    else:
        return func.HttpResponse("No changes detected", status_code=200)
