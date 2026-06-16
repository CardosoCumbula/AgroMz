export interface Product {
  id: string;
  name: string;
  farmer: string;
  province: string;
  category: string;
  price: number;
  qty: number;
  emoji: string;
  desc: string;
  status: "approved" | "pending" | "rejected";
  farmerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "farmer" | "admin";
  verified: boolean;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  id: string;
  client: string;
  email: string;
  phone: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: "pago" | "pendente" | "entregue";
  date: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: "otp" | "order" | "sys" | "payment";
  title: string;
  content: string;
  details?: any;
}

export interface VisitorStats {
  id: string;
  device: string;
  location: string;
  browser: string;
  session_time: number;
  device_spec: string;
  timestamp: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Mandioca Fresca",
    farmer: "Maria Nhantumbo",
    province: "Nampula",
    category: "Tubérculos",
    price: 85,
    qty: 500,
    emoji: "🍠",
    desc: "Mandioca cultivada organicamente nas terras férteis de Nampula. Ideal para cozinhar e fazer farinha.",
    status: "approved"
  },
  {
    id: "p2",
    name: "Tomate Cherry",
    farmer: "João Macuácua",
    province: "Maputo",
    category: "Vegetais",
    price: 120,
    qty: 200,
    emoji: "🍅",
    desc: "Tomates cherry frescos, doces e saborosos. Colhidos nesta semana. Ótimos para saladas.",
    status: "approved"
  },
  {
    id: "p3",
    name: "Milho Seco",
    farmer: "Amina Sitoe",
    province: "Sofala",
    category: "Cereais",
    price: 65,
    qty: 1000,
    emoji: "🌽",
    desc: "Milho seco de qualidade superior. Perfeito para xima, grão ou ração animal.",
    status: "approved"
  },
  {
    id: "p4",
    name: "Amendoim Torrado",
    farmer: "Pedro Cossa",
    province: "Inhambane",
    category: "Nozes & Sementes",
    price: 180,
    qty: 150,
    emoji: "🥜",
    desc: "Amendoim torrado artesanalmente, sem sal. Rico em proteínas e saboroso.",
    status: "approved"
  },
  {
    id: "p5",
    name: "Manga Espada",
    farmer: "Felicidade Mussa",
    province: "Zambézia",
    category: "Frutas",
    price: 40,
    qty: 800,
    emoji: "🥭",
    desc: "Manga espada madura e doce da Zambézia. Disponível em caixas de 10kg.",
    status: "approved"
  },
  {
    id: "p6",
    name: "Couve Portuguesa",
    farmer: "Ernesto Bila",
    province: "Gaza",
    category: "Hortaliças",
    price: 50,
    qty: 300,
    emoji: "🥬",
    desc: "Couve fresca e tenra. Cultivada com irrigação natural. Entrega em Maputo possível.",
    status: "approved"
  },
  {
    id: "p7",
    name: "Feijão Manteiga",
    farmer: "Rosa Tembe",
    province: "Tete",
    category: "Leguminosas",
    price: 140,
    qty: 400,
    emoji: "🫘",
    desc: "Feijão manteiga seco, grande grão. Excelente para sopas e guisados tradicionais.",
    status: "approved"
  },
  {
    id: "p8",
    name: "Banana Prata",
    farmer: "Carlos Langa",
    province: "Manica",
    category: "Frutas",
    price: 60,
    qty: 600,
    emoji: "🍌",
    desc: "Bananas prata maduras da Serra da Gorongosa. Doces e nutritivas.",
    status: "approved"
  },
  {
    id: "p9",
    name: "Piri-piri",
    farmer: "Sónia Mazive",
    province: "Cabo Delgado",
    category: "Vegetais",
    price: 200,
    qty: 50,
    emoji: "🌶️",
    desc: "Piri-piri fresco do Norte. Intensidade alta. Para os amantes de picante genuíno.",
    status: "approved"
  },
  {
    id: "p10",
    name: "Cenoura Dedo",
    farmer: "Tomás Ngomane",
    province: "Nampula",
    category: "Vegetais",
    price: 95,
    qty: 200,
    emoji: "🥕",
    desc: "Cenouras pequenas e doces, perfeitas para comer cruas ou em saladas.",
    status: "approved"
  },
  {
    id: "p11",
    name: "Coco Verde",
    farmer: "Judite Cuna",
    province: "Inhambane",
    category: "Frutas",
    price: 35,
    qty: 400,
    emoji: "🥥",
    desc: "Coco verde com água fresca. Ideal nos dias quentes de Moçambique.",
    status: "approved"
  },
  {
    id: "p12",
    name: "Arroz Carolino",
    farmer: "Dionísio Bique",
    province: "Sofala",
    category: "Cereais",
    price: 110,
    qty: 2000,
    emoji: "🌾",
    desc: "Arroz carolino nacional de grão curto. Excelente para caril, arroz de coco e pratos típicos.",
    status: "approved"
  }
];

export const CATEGORIES = ["Todos", "Vegetais", "Frutas", "Cereais", "Tubérculos", "Leguminosas", "Hortaliças", "Nozes & Sementes"];

export const PROVINCES = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo (Cidade)",
  "Maputo (Província)",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambézia"
];

export const TRANSLATIONS = {
  pt: {
    home: "Início",
    mercado: "Mercado",
    sobre: "Sobre",
    welcome: "Bem-vindo",
    cart: "Carrinho",
    login: "Entrar",
    signup: "Cadastro",
    logout: "Sair",
    buy: "Comprar",
    sell: "Vender",
    addCart: "Adicionar ao Carrinho",
    order: "Encomendar",
    products: "Produtos",
    search: "Pesquisar",
    orders: "As Minhas Encomendas",
    totalPay: "Total a Pagar",
    checkout: "Finalizar Encomenda",
    voiceHelp: "Diga: 'mercado', 'início', 'carrinho', ou 'ajuda'",
    voiceListening: "A ouvir...",
    voiceStopped: "Voz desactivada",
    accessibilityInfo: "Esta plataforma cumpre com WCAG 2.1 AA. Suporta: leitores de ecrã, navegação por teclado, alto contraste e comandos de voz.",
    verifyEmail: "Por favor verifique o seu email com o código OTP enviado.",
    verified: "Email verificado com sucesso!",
    addedCart: "adicionado ao carrinho!",
    loginRequired: "Precisa de entrar para comprar",
    guestBrowse: "A navegar como visitante. Crie uma conta para comprar.",
    paymentMethod: "Método de Pagamento",
    fullName: "Nome Completo",
    emailAddress: "Endereço de Email",
  },
  en: {
    home: "Home",
    mercado: "Market",
    sobre: "About",
    welcome: "Welcome",
    cart: "Cart",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    buy: "Buy",
    sell: "Sell",
    addCart: "Add to Cart",
    order: "Order",
    products: "Products",
    search: "Search",
    orders: "My Orders",
    totalPay: "Total to Pay",
    checkout: "Checkout",
    voiceHelp: "Say: 'market', 'home', 'cart', or 'help'",
    voiceListening: "Listening...",
    voiceStopped: "Voice deactivated",
    accessibilityInfo: "This platform complies with WCAG 2.1 AA: screen readers, keyboard nav, high contrast, voice control.",
    verifyEmail: "Please verify your email using the sent OTP code.",
    verified: "Email verified successfully!",
    addedCart: "added to cart!",
    loginRequired: "You need to log in to buy",
    guestBrowse: "Browsing as guest. Create an account to buy.",
    paymentMethod: "Payment Method",
    fullName: "Full Name",
    emailAddress: "Email Address",
  },
  sn: {
    home: "Kumba",
    mercado: "Musika",
    sobre: "Nezvedu",
    welcome: "Mauya",
    cart: "Bhagi",
    login: "Pinda",
    signup: "Nyoresa",
    logout: "Buda",
    addCart: "Isa muBhagi",
    order: "Renda",
    voiceHelp: "Taura: 'musika', 'kumba', 'bhagi'",
    voiceListening: "Nditeerera...",
    voiceStopped: "Inzwi rakudzimwa",
    verifyEmail: "Tarisa email yako kuti usimbise account yako.",
    verified: "Email yakasimbiswa!",
    addedCart: "yakaiswa mubhagi!",
    loginRequired: "Unofanira kupinda kuti utengi",
    paymentMethod: "Nzira yekubhadhara",
    fullName: "Zita rakazara",
    emailAddress: "Kero ye-email",
  },
  zu: {
    home: "Ikhaya",
    mercado: "Imakethe",
    sobre: "Mayelana",
    welcome: "Wamukelekile",
    cart: "Inqola",
    login: "Ngena",
    signup: "Bhalisa",
    logout: "Phuma",
    addCart: "Faka Enqoleni",
    order: "Oda",
    voiceHelp: "Sho: 'imakethe', 'ikhaya', 'inqola'",
    voiceListening: "Ngizwa...",
    voiceStopped: "Izwi livaliwe",
    verifyEmail: "Sicela uqinisekise i-imeyili yakho.",
    verified: "I-imeyili iqinisekisiwe!",
    addedCart: "ifakwe enqoleni!",
    loginRequired: "Udinga ukungena ukuze uthenge",
    paymentMethod: "Indlela yokukhokha",
    fullName: "Igama eligcwele",
    emailAddress: "Ikheli le-imeyili",
  },
  ts: {
    home: "Kaya",
    mercado: "Maxava",
    sobre: "Hi Hina",
    welcome: "Amukelekile",
    cart: "Nkwama",
    login: "Nghena",
    signup: "Tsarisa",
    logout: "Huma",
    addCart: "Boxa eNkwameni",
    order: "Odela",
    voiceHelp: "Hlamusela: 'maxava', 'kaya', 'nkwama'",
    voiceListening: "Ndzi pfumela...",
    voiceStopped: "Rito ri karibiwe",
    verifyEmail: "Hi kombela u ringanisa email ya wena.",
    verified: "Email yi ringanisiwile!",
    addedCart: "yi boxiwe eNkwameni!",
    loginRequired: "U fanele u nghena u ku xava",
    paymentMethod: "Ndlela yo hakelela",
    fullName: "Vito leri heleleke",
    emailAddress: "Ndlela ya email",
  },
  nd: {
    home: "Ikhaya",
    mercado: "Imakethe",
    sobre: "Ngathi",
    welcome: "Wamukelekile",
    cart: "Inqola",
    login: "Ngena",
    signup: "Bhalisa",
    logout: "Phuma",
    addCart: "Faka",
    order: "Layelisa",
    voiceHelp: "Khuluma: 'imakethe', 'ikhaya'",
    voiceListening: "Ngizwa...",
    voiceStopped: "Izwi livaliwe",
    verifyEmail: "Qinisekisa i-imeyili yakho.",
    verified: "Iqinisekisiwe!",
    addedCart: "ifakiwe!",
    loginRequired: "Ungena kuqala",
    paymentMethod: "Indlela yokuhlawula",
    fullName: "Ibhizo elipheleleyo",
    emailAddress: "Imeyili yekheli",
  }
};
