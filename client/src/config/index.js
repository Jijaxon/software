export const registerFormControls = [
  {
    name: "username",
    label: "Foydalanuvchi nomi",
    placeholder: "Masalan, malika",
    componentType: "input",
    type: "text",
  },
  {
    name: "password",
    label: "Parol",
    placeholder: "Kamida 6 ta belgi",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "login",
    label: "Telefon raqam yoki foydalanuvchi nomi",
    placeholder: "+998 90 123 45 67",
    componentType: "input",
    type: "text",
  },
  {
    name: "password",
    label: "Parol",
    placeholder: "Parolingizni kiriting",
    componentType: "input",
    type: "password",
  },
];

// Mahsulot qo‘shish formasi
export const addProductFormElements = [
  {
    label: "Mahsulot nomi",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Mahsulot nomini kiriting",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Mahsulot haqida ma'lumot kiriting",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      {id: "skincare", label: "Yuz parvarishi"},
      {id: "makeup", label: "Makiyaj"},
      {id: "fragrance", label: "Atirlar"},
      {id: "haircare", label: "Soch parvarishi"},
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      {id: "cerave", label: "CeraVe"},
      {id: "the-ordinary", label: "The Ordinary"},
      {id: "loreal", label: "L'Oréal Paris"},
      {id: "maybelline", label: "Maybelline"},
      {id: "dior", label: "Dior"},
      {id: "fenty-beauty", label: "Fenty Beauty"},
    ],
  },
  {
    label: "Narx (so'm)",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Mahsulot narxini kiriting",
  },
  {
    label: "Discount Percentage (%)",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Chegirma foizini kiriting (ixtiyoriy)",
  },
  {
    label: "Stock Quantity",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Mavjud mahsulot soni",
  },
];

// Navigation menyu
export const shoppingViewHeaderMenuItems = [
  {id: "home", label: "Bosh sahifa", path: "/shop/home"},
  {id: "all-products", label: "Barcha mahsulotlar", path: "/shop/listing"},
  {id: "skincare", label: "Yuz parvarishi", path: "/shop/listing"},
  {id: "makeup", label: "Makiyaj", path: "/shop/listing"},
  {id: "fragrance", label: "Atirlar", path: "/shop/listing"},
  {id: "haircare", label: "Soch parvarishi", path: "/shop/listing"},
  {id: "search", label: "Qidiruv", path: "/shop/search"},
  {id: "about_us", label: "Biz haqimizda", path: "/shop/about"},
];

export const categoryOptionsMap = {
  skincare: "Yuz parvarishi",
  makeup: "Makiyaj",
  fragrance: "Atirlar",
  haircare: "Soch parvarishi",
};

export const brandOptionsMap = {
  cerave: "CeraVe",
  "the-ordinary": "The Ordinary",
  loreal: "L'Oréal Paris",
  maybelline: "Maybelline",
  dior: "Dior",
  "fenty-beauty": "Fenty Beauty",
};

export const filterOptions = {
  category: [
    {id: "skincare", label: "Yuz parvarishi"},
    {id: "makeup", label: "Makiyaj"},
    {id: "fragrance", label: "Atirlar"},
    {id: "haircare", label: "Soch parvarishi"},
  ],
  brand: [
    {id: "cerave", label: "CeraVe"},
    {id: "the-ordinary", label: "The Ordinary"},
    {id: "loreal", label: "L'Oréal Paris"},
    {id: "maybelline", label: "Maybelline"},
    {id: "dior", label: "Dior"},
    {id: "fenty-beauty", label: "Fenty Beauty"},
  ],
};

// Sort (saralash) variantlari
export const sortOptions = [
  {id: "price-lowtohigh", label: "Narx: arzonidan qimmatiga"},
  {id: "price-hightolow", label: "Narx: qimmatidan arzoniga"},
  {id: "title-atoz", label: "Nomi: A dan Z gacha"},
  {id: "title-ztoa", label: "Nomi: Z dan A gacha"},
];

// Yetkazib berish (address formasi)
export const addressFormControls = [
  {
    label: "Manzil",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Ko'cha, uy, xonadon",
  },
  {
    label: "Shahar",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Masalan, Toshkent",
  },
  {
    label: "Pochta indeksi",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "100000",
  },
  {
    label: "Telefon raqami",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "+998 90 123 45 67",
  },
  {
    label: "Izoh",
    name: "notes",
    componentType: "textarea",
    placeholder: "Yetkazib berish bo'yicha qo'shimcha izoh",
  },
];

export const profileFormControls = [
  {
    label: "Foydalanuvchi nomi",
    name: "username",
    componentType: "input",
    type: "text",
    placeholder: "Ismingiz"
  },
  {
    label: "Yangi parol",
    name: "password",
    componentType: "input",
    type: "password",
    placeholder: "O'zgartirmasangiz, bo'sh qoldiring"
  }
]
