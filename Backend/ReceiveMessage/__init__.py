import logging
import azure.functions as func
import os
import json
from utils.message_sender import send_whatsapp_message
from utils.storage import start_conversation, add_message, end_conversation, get_active_conversation
from utils.agent_response import generate_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")
    
    logging.info('Recebida uma requisição HTTP.')

    if req.method == "GET":
        mode = req.params.get('hub.mode')
        token = req.params.get('hub.verify_token')
        challenge = req.params.get('hub.challenge')

        if mode == 'subscribe' and token == VERIFY_TOKEN:
            logging.info("Webhook verificado com sucesso!")
            return func.HttpResponse(challenge, status_code=200)
        else:
            return func.HttpResponse("Verificação falhou", status_code=403)

    elif req.method == "POST":
        try:
            req_body = req.get_json()

            entries = req_body.get("entry", [])
            for entry in entries:
                changes = entry.get("changes", [])
                for change in changes:
                    if change.get("field") == "messages":
                        value = change.get("value", {})
                        messages = value.get("messages", [])

                        for message in messages:
                            if message.get("type") == "text" and "from" in message:
                                from_number = message["from"]
                                user_message = message["text"]["body"]

                                current_conversation_id, current_conversation_data = get_active_conversation(from_number)

                                conversation_id = None
                                ##TODO: limit the number of messages to avoid spamming the agent
                                messages = []

                                if current_conversation_data is None:
                                    conversation_id = start_conversation(from_number)
                                else: 
                                    conversation_id = current_conversation_id
                                    messages = current_conversation_data.get("messages", [])

                                add_message(from_number, conversation_id, "user", user_message)

                                agent_answer = generate_response(user_message, messages, from_number, conversation_id)
                                add_message(from_number, conversation_id, "assistant", agent_answer)

                                whatsapp_result = send_whatsapp_message(
                                    to_number=from_number,
                                    body=agent_answer
                                )

                                return func.HttpResponse(
                                    json.dumps({
                                        "success": True,
                                        "response": agent_answer,
                                        "whatsapp_result": whatsapp_result
                                    }),
                                    status_code=200,
                                    mimetype="application/json"
                                )

            return func.HttpResponse("No customer message to process.", status_code=200)

        except Exception as e:
            logging.error(f"Erro: {str(e)}")
            return func.HttpResponse(
                json.dumps({"erro": str(e)}),
                status_code=400,
                mimetype="application/json"
            )
