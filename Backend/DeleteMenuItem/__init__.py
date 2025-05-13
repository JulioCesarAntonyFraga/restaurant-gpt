import azure.functions as func
from firebase_admin import firestore
from utils.auth import verify_token

db = firestore.client()

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    item_id = req.route_params.get("id")
    if not item_id:
        return func.HttpResponse("Missing menu item ID", status_code=400)

    doc_ref = db.collection("menu").document(item_id)
    doc = doc_ref.get()

    if not doc.exists:
        return func.HttpResponse("Menu item not found", status_code=404)

    try:
        doc_ref.delete()
        return func.HttpResponse(
            f"Item com ID {item_id} deletado com sucesso",
            status_code=200
        )
    except Exception as e:
        return func.HttpResponse(
            f"Erro ao deletar item: {str(e)}",
            status_code=500
        )
