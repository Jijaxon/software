export const registerFormControls = [
  {
    name: "username",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const verifyFormControls = [
  {
    name: "code",
    label: "Code",
    placeholder: "Enter your code",
    componentType: "input",
    type: "number",
  },
]

export const reVerifyFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "mail",
  },
]

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
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
    label: "Price ($)",
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
  {id: "price-lowtohigh", label: "Price: Low to High"},
  {id: "price-hightolow", label: "Price: High to Low"},
  {id: "title-atoz", label: "Nomi: A dan Z gacha"},
  {id: "title-ztoa", label: "Nomi: Z dan A gacha"},
];

// Yetkazib berish (address formasi)
export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your delivery address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Postal Code",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter postal code",
  },
  {
    label: "Phone Number",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any special delivery notes",
  },
];

export const profileFormControls = [
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "mail",
    placeholder: "Enter your email",
  },
  {
    label: "Username",
    name: "username",
    componentType: "input",
    type: "text",
    placeholder: "Enter your username"
  },
  {
    label: "Password",
    name: "password",
    componentType: "input",
    type: "text",
    placeholder: "Enter your password"
  }
]