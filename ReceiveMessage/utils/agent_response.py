from openai import OpenAI
import os

openai_api_key = os.environ.get('OPENAI_API_KEY')

##TODO: Add this to a env variable
client = OpenAI(api_key=openai_api_key)

functions = [
                {
                    "name": "finalize_order",
                    "description": "Finaliza o pedido e salva no banco",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "price": {"type": "number"},
                                        "amount": {"type": "integer"},
                                        "observations": {"type": "string"}
                                    },
                                    "required": ["name", "price", "amount"]
                                }
                            },
                            "total": {"type": "number"},
                            "isDelivery": {"type": "boolean"},
                            "address": {"type": "string"},
                            "orderedAt": {"type": "string"},
                            "paymentMethod": {"type": "string"},
                            "change": {"type": "number"},
                            "order_status": {
                                "type": "string",
                                "enum": [
                                    "In Progress",
                                    "On the Way to the customer",
                                    "Ready to take away",
                                    "Delivered/Picked up"
                                ]
                            }
                        },
                        "required": ["items", "total", "paymentMethod", "order_status"]
                    }
                }
],


# Histórico fixo, estilo “prompt engineering” de restaurante
base_context = [
    {
        "role": "system",
        "content": [
            {
                "type": "input_text",
                "text": (
                    "Você é um atendente de restaurante do qual o único objetivo é anotar pedidos. "
                    "Você deve relacionar as mensagens recebidas do cliente com o cardápio que você terá à disposição. "
                    "Responda com um tom educado, sem ser muito descontraído, e foque em fechar o pedido. "
                    "Tente sugerir acompanhamentos que façam sentido com o cardápio, como bebidas, saladas, ou porções. "
                    "Tire dúvidas sobre valores e composições dos pratos. Ao final da compra, apresente um sumário dos itens que foram pedidos. "
                    "Após a confirmação, confirme também o método de pagamento, e se o cliente deseja retirar o pedido na loja física, ou se deseja que seja entregue em sua residência. "
                    "No caso de entrega, informe o valor total atualizado com a taxa de entrega."
                    """
                    Cardápio: 
                    🍔 Hambúrguer Simples - R$10,00  
                    🍔 Hambúrguer Duplo - R$12,00  
                    🍟 Batata Frita Pequena - R$6,00  
                    🍟 Batata Frita Grande - R$8,00  
                    🥤 Pepsi Lata - R$2,00  
                    🥤 Guaraná 2L - R$6,00  
                    🍺 Cerveja Lata - R$4,00  
                    🥤 Suco de Caixinha - R$3,00
                    """
                )
            }
        ]
    }
]


def generate_response(user_message: str, historic=[], phone_number: str = "", conversation_id: str = "") -> str:
    # Inicia com o contexto básico
    base_context.append({
        "role": "system",
        "content": f"Cardápio:{get_menu()}"
    })
    messages = base_context.copy()

    # Adiciona as mensagens anteriores ao histórico
    for message in historic:
        messages.append({
            "role": message["role"],
            "content": message["content"]
        })

    # Adiciona a mensagem atual do usuário
    messages.append({
        "role": "user",
        "content": user_message
    })

    # Chamada para o modelo da OpenAI com funções definidas
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=1,
        max_tokens=2048,
        top_p=1,
        functions=functions,  # Funções que podem ser chamadas pelo modelo
        function_call="auto"   # Deixe o modelo chamar funções automaticamente se necessário
    )

    # A resposta será uma lista de escolhas, geralmente só uma escolha
    choice = response.choices[0]  # Acessando a primeira escolha
    if choice.finish_reason == "function_call":  # Verifica se a razão de término foi chamada de função
        called_function = choice.message.function_call
        
        if called_function.name == "finalize_order":  # Se a função chamada for 'finalize_order'
            # Extrai os parâmetros da função chamada
            args = json.loads(called_function.arguments)

            # Salva o pedido com as informações extraídas
            save_order(
                phone_number=phone_number,
                items=args.get("items", []),
                total=args.get("total"),
                is_delivery=args.get("is_delivery", False),
                address=args.get("address"),
                payment_method=args.get("payment_method"),
                change=args.get("change"),
                status=args.get("status")
            )

            end_conversation(phone_number, conversation_id)

            return "Seu pedido foi confirmado e será preparado. Agradecemos pela preferência!"

    # A resposta do assistente será no campo 'content' dentro de 'choices'
    assistant_answer = choice.message.content

    return assistant_answer