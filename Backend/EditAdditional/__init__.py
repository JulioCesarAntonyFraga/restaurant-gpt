import azure.functions as func
import json
import time
from firebase_admin import firestore
from utils.auth import verify_token

db = firestore.client()

required_fields = ["name", "price"]
optional_fields = ["description"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        additional = req.get_json()
    except:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    additional_id = additional.get("id")
    if not additional_id:
        return func.HttpResponse("Missing additional id", status_code=400)

    doc_ref = db.collection("additionals").document(additional_id)
    existing_doc = doc_ref.get()

    if not existing_doc.exists:
        return func.HttpResponse("Additional not found", status_code=404)

    existing_data = existing_doc.to_dict()
    updates = {}

    for field in required_fields + optional_fields:
        if field in additional and additional[field] != existing_data.get(field):
            updates[field] = additional[field]

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
