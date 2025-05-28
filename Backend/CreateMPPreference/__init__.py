# create_preference/__init__.py
import os
import json
import logging
import azure.functions as func
import mercadopago

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Requisição recebida para criar preferência Mercado Pago.")

    try:
        # Access Token do Mercado Pago (seguro, nunca exponha no frontend)
        mp = mercadopago.SDK(os.environ["MP_ACCESS_TOKEN"])

        # Dados recebidos do frontend (itens, valor, etc.)
        data = req.get_json()

        items = data.get("items", [])
        if not items:
            return func.HttpResponse("Itens obrigatórios", status_code=400)

        # Criação da preferência de pagamento
        preference_data = {
            "items": items,
            "installments": 1,
            "excluded_payment_types": [
                { "id": "ticket" }  
            ],
            "back_urls": {
                "success": "https://restaurant-gpt-tan.vercel.app/",
                "failure": "https://restaurant-gpt-tan.vercel.app/",
                "pending": "https://restaurant-gpt-tan.vercel.app/"
            },
            "auto_return": "approved"
        }

        preference_response = mp.preference().create(preference_data)
        preference = preference_response["response"]

        return func.HttpResponse(
            json.dumps({ "id": preference["id"] }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Erro ao criar preferência: {str(e)}")
        return func.HttpResponse(f"Erro interno: {str(e)}", status_code=500)
