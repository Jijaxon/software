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

// Notebook qo‘shish formasi
export const addProductFormElements = [
  {
    label: "Model",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter notebook model (e.g. HP Pavilion 15)",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter notebook description and specifications",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      {id: "gaming", label: "Gaming"},
      {id: "business", label: "Business"},
      {id: "student", label: "Student"},
      {id: "accessories", label: "Accessories"},
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      {id: "hp", label: "HP"},
      {id: "dell", label: "Dell"},
      {id: "lenovo", label: "Lenovo"},
      {id: "asus", label: "Asus"},
      {id: "acer", label: "Acer"},
      {id: "apple", label: "Apple"},
    ],
  },
  {
    label: "Price ($)",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter notebook price",
  },
  {
    label: "Discount Percentage (%)",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter discount price (optional)",
  },
  {
    label: "Stock Quantity",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter available stock",
  },
];

// Navigation menyu
export const shoppingViewHeaderMenuItems = [
  {id: "home", label: "Home", path: "/shop/home"},
  {id: "notebooks", label: "All products", path: "/shop/listing"},
  {id: "gaming", label: "Gaming Laptops", path: "/shop/listing"},
  {id: "business", label: "Business Laptops", path: "/shop/listing"},
  {id: "student", label: "Student Laptops", path: "/shop/listing"},
  {id: "accessories", label: "Accessories", path: "/shop/listing"},
  {id: "search", label: "Search", path: "/shop/search"},
  {id: "about_us", label: "About us", path: "/shop/about"},
];

// Kategoriya xaritasi
export const categoryOptionsMap = {
  gaming: "Gaming",
  business: "Business",
  student: "Student",
  accessories: "Accessories",
};

// Brend xaritasi
export const brandOptionsMap = {
  hp: "HP",
  dell: "Dell",
  lenovo: "Lenovo",
  asus: "Asus",
  acer: "Acer",
  apple: "Apple",
};

// Filterlar uchun variantlar
export const filterOptions = {
  category: [
    {id: "gaming", label: "Gaming"},
    {id: "business", label: "Business"},
    {id: "student", label: "Student"},
    {id: "accessories", label: "Accessories"},
  ],
  brand: [
    {id: "hp", label: "HP"},
    {id: "dell", label: "Dell"},
    {id: "lenovo", label: "Lenovo"},
    {id: "asus", label: "Asus"},
    {id: "acer", label: "Acer"},
    {id: "apple", label: "Apple"},
  ],
};

// Sort (saralash) variantlari
export const sortOptions = [
  {id: "price-lowtohigh", label: "Price: Low to High"},
  {id: "price-hightolow", label: "Price: High to Low"},
  {id: "title-atoz", label: "Model: A to Z"},
  {id: "title-ztoa", label: "Model: Z to A"},
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