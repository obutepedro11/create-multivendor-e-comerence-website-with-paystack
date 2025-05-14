// This file contains utility functions for working with local storage data

// Initialize local storage with sample data if it doesn't exist
export function initializeLocalStorage() {
  // Initialize users if they don't exist
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Vendor User",
        email: "vendor@example.com",
        password: "vendor123",
        role: "vendor",
        createdAt: new Date().toISOString(),
        vendorInfo: {
          storeName: "Tech Gadgets",
          description: "The best tech gadgets at affordable prices",
          logo: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=200&auto=format&fit=crop",
          banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
          approved: true,
        },
      },
      {
        id: "3",
        name: "Customer User",
        email: "customer@example.com",
        password: "customer123",
        role: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Fashion Vendor",
        email: "fashion@example.com",
        password: "fashion123",
        role: "vendor",
        createdAt: new Date().toISOString(),
        vendorInfo: {
          storeName: "Nigerian Fashion Hub",
          description: "Traditional and modern Nigerian fashion for all occasions",
          logo: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=200&auto=format&fit=crop",
          banner: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop",
          approved: true,
        },
      },
      {
        id: "5",
        name: "Book Vendor",
        email: "books@example.com",
        password: "books123",
        role: "vendor",
        createdAt: new Date().toISOString(),
        vendorInfo: {
          storeName: "African Literature Store",
          description: "The best collection of African literature and educational books",
          logo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop",
          banner: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&auto=format&fit=crop",
          approved: true,
        },
      },
    ]
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }

  // Initialize products if they don't exist
  if (!localStorage.getItem("products")) {
    const defaultProducts = [
      // Electronics Category
      {
        id: "1",
        name: "Samsung Galaxy A54",
        description: "6.4-inch smartphone with 128GB storage, 8GB RAM and 50MP camera",
        price: 450000, // ₦450,000
        vendorId: "2",
        categoryId: "1",
        images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=500&auto=format&fit=crop"],
        stock: 15,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Oraimo FreePods 4",
        description: "Wireless earbuds with noise cancellation and 30-hour battery life",
        price: 25000, // ₦25,000
        vendorId: "2",
        categoryId: "1",
        images: ["https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?q=80&w=500&auto=format&fit=crop"],
        stock: 30,
        featured: true,
        createdAt: new Date().toISOString(),
      },

      // Clothing Category
      {
        id: "3",
        name: "Ankara Print Dress",
        description: "Traditional Nigerian Ankara print dress with modern design",
        price: 15000, // ₦15,000
        vendorId: "4",
        categoryId: "2",
        images: ["https://images.unsplash.com/photo-1630551803376-12e6c33ce2f6?q=80&w=500&auto=format&fit=crop"],
        stock: 20,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Men's Kaftan Set",
        description: "Elegant traditional Nigerian kaftan with embroidery, includes cap",
        price: 22000, // ₦22,000
        vendorId: "4",
        categoryId: "2",
        images: ["https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=500&auto=format&fit=crop"],
        stock: 12,
        featured: true,
        createdAt: new Date().toISOString(),
      },

      // Home & Kitchen Category
      {
        id: "5",
        name: "Binatone Blender",
        description: "5-speed blender with pulse function and 1.5L capacity",
        price: 35000, // ₦35,000
        vendorId: "2",
        categoryId: "3",
        images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=500&auto=format&fit=crop"],
        stock: 8,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "6",
        name: "Non-stick Pot Set",
        description: "Set of 4 non-stick cooking pots with glass lids",
        price: 28000, // ₦28,000
        vendorId: "2",
        categoryId: "3",
        images: ["https://images.unsplash.com/photo-1584990347449-716dc5a82471?q=80&w=500&auto=format&fit=crop"],
        stock: 10,
        featured: true,
        createdAt: new Date().toISOString(),
      },

      // Beauty Category
      {
        id: "7",
        name: "Shea Butter Hair Cream",
        description: "Natural hair moisturizer with pure Nigerian shea butter",
        price: 5000, // ₦5,000
        vendorId: "4",
        categoryId: "4",
        images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=500&auto=format&fit=crop"],
        stock: 25,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "8",
        name: "R&R Skincare Set",
        description: "Complete skincare set with cleanser, toner, and moisturizer",
        price: 12000, // ₦12,000
        vendorId: "4",
        categoryId: "4",
        images: ["https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=500&auto=format&fit=crop"],
        stock: 15,
        featured: true,
        createdAt: new Date().toISOString(),
      },

      // Books Category
      {
        id: "9",
        name: "Things Fall Apart",
        description: "Classic Nigerian novel by Chinua Achebe",
        price: 3500, // ₦3,500
        vendorId: "5",
        categoryId: "5",
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500&auto=format&fit=crop"],
        stock: 40,
        featured: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "10",
        name: "Half of a Yellow Sun",
        description: "Award-winning novel by Chimamanda Ngozi Adichie",
        price: 4200, // ₦4,200
        vendorId: "5",
        categoryId: "5",
        images: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=500&auto=format&fit=crop"],
        stock: 35,
        featured: true,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("products", JSON.stringify(defaultProducts))
  }

  // Initialize categories if they don't exist
  if (!localStorage.getItem("categories")) {
    const defaultCategories = [
      { id: "1", name: "Electronics", slug: "electronics" },
      { id: "2", name: "Clothing", slug: "clothing" },
      { id: "3", name: "Home & Kitchen", slug: "home-kitchen" },
      { id: "4", name: "Beauty", slug: "beauty" },
      { id: "5", name: "Books", slug: "books" },
    ]
    localStorage.setItem("categories", JSON.stringify(defaultCategories))
  }

  // Initialize orders if they don't exist
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]))
  }
}

// Get all products
export function getProducts() {
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

// Get product by ID
export function getProductById(id: string) {
  const products = getProducts()
  return products.find((product: any) => product.id === id) || null
}

// Get products by vendor ID
export function getProductsByVendor(vendorId: string) {
  const products = getProducts()
  return products.filter((product: any) => product.vendorId === vendorId)
}

// Get featured products
export function getFeaturedProducts() {
  const products = getProducts()
  return products.filter((product: any) => product.featured)
}

// Get all vendors
export function getVendors() {
  const users = localStorage.getItem("users")
  const allUsers = users ? JSON.parse(users) : []
  return allUsers.filter((user: any) => user.role === "vendor")
}

// Get vendor by ID
export function getVendorById(id: string) {
  const vendors = getVendors()
  return vendors.find((vendor: any) => vendor.id === id) || null
}

// Get all categories
export function getCategories() {
  const categories = localStorage.getItem("categories")
  return categories ? JSON.parse(categories) : []
}

// Get category by ID
export function getCategoryById(id: string) {
  const categories = getCategories()
  return categories.find((category: any) => category.id === id) || null
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  const categories = getCategories()
  return categories.find((category: any) => category.slug === slug) || null
}

// Get all orders
export function getOrders() {
  const orders = localStorage.getItem("orders")
  return orders ? JSON.parse(orders) : []
}

// Get order by ID
export function getOrderById(id: string) {
  const orders = getOrders()
  return orders.find((order: any) => order.id === id) || null
}

// Get orders by user ID
export function getOrdersByUser(userId: string) {
  const orders = getOrders()
  return orders.filter((order: any) => order.userId === userId)
}

// Get orders by vendor ID
export function getOrdersByVendor(vendorId: string) {
  const orders = getOrders()
  return orders.filter((order: any) => {
    return order.items.some((item: any) => item.vendorId === vendorId)
  })
}

// Save order to localStorage
export function saveOrder(order: any) {
  const orders = getOrders()
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))
  return order
}
