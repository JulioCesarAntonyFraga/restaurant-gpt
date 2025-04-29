import firebase_admin
from firebase_admin import credentials, firestore
import uuid
import time

# Initialize Firebase Admin with service account
cred = credentials.Certificate("./firebase-credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def start_conversation(phone_number: str) -> str:
    conversation_id = str(uuid.uuid4())
    timestamp = int(time.time())

    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc_ref.set({
        "conversation_ended": False,
        "started_at": timestamp,
        "messages": []
    })

    return conversation_id

def add_message(phone_number: str, conversation_id: str, role: str, content: str):
    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        messages = data.get("messages", [])
        messages.append({
            "role": role,
            "content": content,
            "timestamp": int(time.time())
        })
        doc_ref.update({
            "messages": messages
        })
    else:
        raise ValueError("Conversation not found")

def end_conversation(phone_number: str, conversation_id: str):
    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc_ref.update({
        "conversation_ended": True,
        "ended_at": int(time.time())
    })

def get_active_conversation(phone_number: str):
    chats_ref = db.collection("conversations").document(phone_number).collection("chats")
    query = chats_ref.where("conversation_ended", "==", False).order_by("started_at", direction=firestore.Query.DESCENDING).limit(1).stream()

    for chat in query:
        return chat.id, chat.to_dict()
    
    return None, None