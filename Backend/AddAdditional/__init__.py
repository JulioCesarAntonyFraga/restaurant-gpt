import json
from utils.storage import add_additional
import azure.functions as func
from utils.auth import verify_token

required_fields = ["name", "price"]
optional_fields = ["description"]
def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        additional = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    for key, value in additional.items():
        if key not in required_fields and key not in optional_fields:
            return func.HttpResponse(f"Invalid field: {key}", status_code=400)
        if key in required_fields and not value and value != 0:
            return func.HttpResponse(f"Missing {key}", status_code=400)

    return func.HttpResponse(
        json.dumps(add_additional(additional)),
        status_code=200,
        mimetype="application/json"
    )
