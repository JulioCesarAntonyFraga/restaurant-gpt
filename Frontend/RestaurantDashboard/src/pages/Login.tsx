import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase"; // Ajuste o caminho conforme necessário
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "react-router-dom";

type LoginRequest = {
  email: string;
  password: string;
};

const Login = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
          navigate("/pedidos", { replace: true });
        }
    }, [user, navigate]);
    
    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
    
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const [responseMsg, setResponseMsg] = useState("");
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            signInWithEmailAndPassword(auth, formData.email, formData.password)
              .then(async (userCredential) => {
                const user = userCredential.user;
                const idToken = await user.getIdToken();

                setResponseMsg("Login realizado com sucesso!");
                console.log("ID Token:", idToken);
                
                // Agora você pode usar `idToken` nas requisições aos Azure Functions
              })
              .catch((error) => {
                
                setResponseMsg(error.message || "Erro ao efetuar login.");
                console.error("Erro ao autenticar:", error.message);
              });
        } catch (err) {
            console.error(err);
            setResponseMsg("Erro de conexão com o servidor.");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
                <button type="submit" className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded">Entrar</button>
            </form>
            {responseMsg && <p className="text-center text-sm text-gray-600">{responseMsg}</p>}
        </div>
    );
};

export default Login;
