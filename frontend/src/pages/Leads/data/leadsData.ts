import { Column } from "../../../types/Column";

export const leadsData: Column[] = [
  {
    id: 1,
    title: "NOVO LEAD",
    color: "#dc2626",
    totalValue: 120500,
    items: [
      {
        id: 1,
        name: "Amanda Lopes",
        car: "Ford Ka 2021",
        price: 58500,
        time: "Há 2 dias",
        status: "Novo",
        date: "2026-04-11",
        avatar: "https://i.pravatar.cc/150?img=1",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      },
      {
        id: 2,
        name: "Carlos Souza",
        car: "HB20 2020",
        price: 62000,
        time: "Hoje",
        status: "Novo",
        date: "2026-04-13",
        avatar: "https://i.pravatar.cc/150?img=2",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      }
    ]
  },
  {
    id: 2,
    title: "EM ATENDIMENTO",
    color: "#2563eb",
    totalValue: 170900,
    items: [
      {
        id: 3,
        name: "Juliana Martins",
        car: "Onix Plus 2022",
        price: 78900,
        time: "Há 1 dia",
        status: "Contato",
        date: "2026-04-12",
        avatar: "https://i.pravatar.cc/150?img=3",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      },
      {
        id: 4,
        name: "Pedro Alves",
        car: "Corolla 2021",
        price: 92000,
        time: "Hoje",
        status: "Negociação",
        date: "2026-04-13",
        avatar: "https://i.pravatar.cc/150?img=4",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      }
    ]
  },
  {
    id: 3,
    title: "PROPOSTA",
    color: "#f59e0b",
    totalValue: 120000,
    items: [
      {
        id: 5,
        name: "Fernanda Lima",
        car: "Jeep Compass",
        price: 120000,
        time: "Há 3 dias",
        status: "Proposta",
        date: "2026-04-10",
        avatar: "https://i.pravatar.cc/150?img=5",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      }
    ]
  },
  {
    id: 4,
    title: "FECHADO",
    color: "#16a34a",
    totalValue: 95000,
    items: [
      {
        id: 6,
        name: "Ricardo Mendes",
        car: "Civic 2020",
        price: 95000,
        time: "Ontem",
        status: "Vendido",
        date: "2026-04-12",
        avatar: "https://i.pravatar.cc/150?img=6",
        image: "https://cdn-icons-png.flaticon.com/512/743/743131.png"
      }
    ]
  }
];