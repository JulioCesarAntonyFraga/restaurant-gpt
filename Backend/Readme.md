# Rotas da API

    
- AddMenuItem: [POST] http://localhost:7071/api/add-menu-item

- AddOrder: [POST] http://localhost:7071/api/add-order
```json
{
  "phone_number": "11999999999",
  "items": [
    {
      "id": "0e180754-2dd4-47f2-9d94-fc81f48d5e56",
      "quantity": 2,
      "observation": "test observation"
    }
  ],
  "is_delivery": true,
  "cep": "93044560",
  "rua": "rua guaporé",
  "numero": "145",
  "bairro": "santo andré",
  "cidade": "São leopoldo",
  "payment_method": "cash"
}
```

- AdvanceOrderStatus: [PUT] http://localhost:7071/api/advance-order-status/{order_id}

- DeleteMenuItem: [DELETE] http://localhost:7071/api/delete-menu-item/{id}

- EditMenuItem: [PUT] http://localhost:7071/api/edit-menu-item

- GetMenuItem: [GET] http://localhost:7071/api/get-menu-item/{id}

- ReceiveMessage: [POST,GET] http://localhost:7071/api/receive-message

- RegressOrderStatus: [PUT] http://localhost:7071/api/regress-order-status/{order_id}

- RetrieveMenuItems: [GET] http://localhost:7071/api/retrieve-menu-items

- RetrieveOrders: [GET] http://localhost:7071/api/retrieve-orders