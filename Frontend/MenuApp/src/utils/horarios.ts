

type Horario ={
    inicio: string;
    fim: string;
} | null;

export const horarioFuncionamento: Record<number, Horario> = {
    0: null,
    1: {inicio: "08:00", fim: "18:00"},
    2: {inicio: "08:00", fim: "18:00"},
    3: {inicio: "08:00", fim: "18:00"},
    4: {inicio: "08:00", fim: "18:00"},
    5: {inicio: "08:00", fim: "18:00"},
    6: {inicio: "08:00", fim: "18:00"},
};

export const estaDentroDoHorario = (): boolean => {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const horario = horarioFuncionamento[diaSemana];

    if (!horario) return false;

    const [hInicio, mInicio] = horario.inicio.split(":").map(Number);
    const [hFim, mFim] = horario.fim.split(":"). map(Number);
    
    const inicio = new Date();
    inicio.setHours(hInicio, mInicio, 0);

    const fim = new Date();
    fim.setHours(hFim, mFim, 0);

    return agora >= inicio && agora <= fim;
};

export const getStatusLoja = (): {texto: string; aberto: boolean} => {
    const agora =new Date();
    const diaSemana = agora.getDay();
    const horario = horarioFuncionamento[diaSemana];
    if (!horario) {
        return { aberto: false, texto: "🔴 Fechado hoje"};
    }const [hInicio, mInicio] = horario.inicio.split(":").map(Number);
  const [hFim, mFim] = horario.fim.split(":").map(Number);

  const inicio = new Date();
  inicio.setHours(hInicio, mInicio, 0);

  const fim = new Date();
  fim.setHours(hFim, mFim, 0);

  const aberto = agora >= inicio && agora <= fim;

  const texto = aberto
    ? `🟢 Aberto agora – até ${horario.fim}`
    : `🔴 Fechado – abre às ${horario.inicio}`;

  return { aberto, texto };
};