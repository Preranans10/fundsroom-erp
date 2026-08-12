import React, { useEffect, useMemo, useState } from "react";

const API = "https://fundsroom-erp-f5ir.onrender.com";

/* ================= TYPES ================= */

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
  createdAt?: string;
};

type Customer = {
  id?: number;
  name?: string;
  customerName?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: string;
  address?: string;
  status?: string;
  followUpDate?: string;
  notes?: string;
};

type Product = {
  id?: number;
  name?: string;
  productName?: string;
  sku?: string;
  code?: string;
  category?: string;
  currentStock?: number;
  current_stock?: number;
  stock?: number;
  unitPrice?: number;
  unit_price?: number;
  minimumStockAlertQuantity?: number;
  minimum_stock_alert_quantity?: number;
  location?: string;
};

type Movement = {
  id?: number;
  product_id?: number;
  productId?: number;
  product_name?: string;
  productName?: string;
  quantity?: number;
  movement_type?: string;
  movementType?: string;
  reason?: string;
  created_at?: string;
  createdAt?: string;
};

type Challan = {
  id?: number;
  challan_number?: string;
  challanNumber?: string;
  customer_id?: number;
  customer_name?: string;
  customerName?: string;
  total_quantity?: number;
  totalQuantity?: number;
  status?: string;
  created_at?: string;
  createdAt?: string;
};

/* ================= API ================= */

async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string
) {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function getArray(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function productStock(p: Product) {
  return Number(
    p.currentStock ??
      p.current_stock ??
      p.stock ??
      0
  );
}

function productPrice(p: Product) {
  return Number(
    p.unitPrice ??
      p.unit_price ??
      0
  );
}

/* ================= APP ================= */

function App() {
  const [page, setPage] = useState("Dashboard");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  if (!token) {
    return (
      <Login
        onLogin={(newToken, loggedUser) => {
          localStorage.setItem("token", newToken);

          if (loggedUser) {
            localStorage.setItem(
              "user",
              JSON.stringify(loggedUser)
            );
          }

          setToken(newToken);
          setUser(loggedUser);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        logout={logout}
      />

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              FundsRoom / {page}
            </div>

            <h1>{page}</h1>
          </div>

          <div className="top-user">
            <div className="top-avatar">
              {(user?.name ||
                user?.email ||
                "A")[0].toUpperCase()}
            </div>

            <div className="top-user-info">
              <strong>
                {user?.name ||
                  user?.email ||
                  "Administrator"}
              </strong>

              <small>
                {user?.role || "ADMIN"}
              </small>
            </div>
          </div>
        </header>

        <section className="page-content">
          {page === "Dashboard" && (
            <Dashboard
              token={token}
              setPage={setPage}
            />
          )}

          {page === "Customers" && (
            <Customers token={token} />
          )}

          {page === "Products" && (
            <Products token={token} />
          )}

          {page === "Stock Movements" && (
            <StockMovements token={token} />
          )}

          {page === "Sales Challans" && (
            <Challans token={token} />
          )}

          {page === "Users" && (
            <Users token={token} />
          )}

          {page === "Reports" && (
            <Reports token={token} />
          )}
        </section>
      </main>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void;
}) {
  const [email, setEmail] = useState(
    "admin@fundsroom.com"
  );

  const [password, setPassword] = useState(
    "Admin@123"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch(
        `${API}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const jwt =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.data?.accessToken;

      const loggedUser =
        data.user ||
        data.data?.user ||
        null;

      if (!jwt) {
        throw new Error(
          "JWT token was not returned"
        );
      }

      onLogin(jwt, loggedUser);
    } catch (error: any) {
      setError(
        error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form
        className="login-box"
        onSubmit={login}
      >
        <div className="login-brand">
          <div className="brand-mark">F</div>

          <div>
            <strong>FundsRoom</strong>
            <span>ERP & CRM</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>
            Sign in to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <label>Email address</label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ================= SIDEBAR ================= */

function Sidebar({
  page,
  setPage,
  logout,
}: {
  page: string;
  setPage: (page: string) => void;
  logout: () => void;
}) {
  const menu = [
    ["Dashboard", "⌂"],
    ["Customers", "♙"],
    ["Products", "▦"],
    ["Stock Movements", "↕"],
    ["Sales Challans", "▤"],
    ["Users", "♟"],
    ["Reports", "◫"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">F</div>

        <div className="brand-copy">
          <strong>FundsRoom</strong>
          <span>ERP & CRM</span>
        </div>
      </div>

      <div className="sidebar-label">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">
        {menu.map(([title, icon]) => (
          <button
            key={title}
            className={
              page === title
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setPage(title)}
          >
            <span className="sidebar-icon">
              {icon}
            </span>

            <span>{title}</span>

            {page === title && (
              <span className="active-dot" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-item logout-button"
          onClick={logout}
        >
          <span className="sidebar-icon">
            ↪
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({
  token,
  setPage,
}: {
  token: string;
  setPage: (p: string) => void;
}) {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(
          `${API}/dashboard/stats`,
          {},
          token
        );

        setStats(data.data || data);
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const customers =
    stats.customers ??
    stats.totalCustomers ??
    0;

  const products =
    stats.products ??
    stats.totalProducts ??
    0;

  const lowStock =
    stats.lowStock ??
    stats.lowStockProducts ??
    0;

  const challans =
    stats.challans ??
    stats.totalChallans ??
    0;

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <div className="hero-eyebrow">
            BUSINESS OVERVIEW
          </div>

          <h2>Good morning 👋</h2>

          <p>
            Here's what's happening with your
            business today.
          </p>
        </div>

        <div className="hero-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString()}
          </strong>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={
            loading ? "..." : customers
          }
          icon="♙"
          description="Registered customers"
        />

        <StatCard
          title="Total Products"
          value={
            loading ? "..." : products
          }
          icon="▦"
          description="Products in inventory"
        />

        <StatCard
          title="Low Stock"
          value={
            loading ? "..." : lowStock
          }
          icon="!"
          description="Items needing attention"
          danger={Number(lowStock) > 0}
        />

        <StatCard
          title="Sales Challans"
          value={
            loading ? "..." : challans
          }
          icon="▤"
          description="Generated challans"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title-row">
            <div>
              <h3>Business Overview</h3>
              <p>Current ERP statistics</p>
            </div>
          </div>

          <div className="overview-cards">
            <div className="overview-card">
              <div className="overview-icon blue">
                ♙
              </div>

              <div>
                <strong>{customers}</strong>
                <span>Customers</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon purple">
                ▦
              </div>

              <div>
                <strong>{products}</strong>
                <span>Products</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon green">
                ▤
              </div>

              <div>
                <strong>{challans}</strong>
                <span>Challans</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <div>
              <h3>Quick Actions</h3>
              <p>Frequently used modules</p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action"
              onClick={() =>
                setPage("Customers")
              }
            >
              <div className="quick-action-icon">
                ♙
              </div>

              <div>
                <strong>
                  Customer Management
                </strong>
                <span>
                  Manage customers
                </span>
              </div>

              <span className="arrow">›</span>
            </button>

            <button
              className="quick-action"
              onClick={() =>
                setPage("Products")
              }
            >
              <div className="quick-action-icon">
                ▦
              </div>

              <div>
                <strong>Inventory</strong>
                <span>
                  Manage products and stock
                </span>
              </div>

              <span className="arrow">›</span>
            </button>

            <button
              className="quick-action"
              onClick={() =>
                setPage("Sales Challans")
              }
            >
              <div className="quick-action-icon">
                ▤
              </div>

              <div>
                <strong>Sales Challans</strong>
                <span>
                  Create sales documents
                </span>
              </div>

              <span className="arrow">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  danger,
}: {
  title: string;
  value: any;
  icon: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span>{title}</span>

        <div
          className={
            danger
              ? "stat-icon warning"
              : "stat-icon"
          }
        >
          {icon}
        </div>
      </div>

      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

/* ================= CUSTOMERS ================= */

function Customers({
  token,
}: {
  token: string;
}) {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] =
    useState(false);

  const emptyForm = {
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "Retail",
    address: "",
    status: "Lead",
    followUpDate: "",
    notes: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  async function loadCustomers() {
    try {
      const data = await apiFetch(
        `${API}/customers`,
        {},
        token
      );

      setCustomers(
        getArray(data, ["customers"])
      );
    } catch {
      setCustomers([]);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [token]);

  async function addCustomer(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await apiFetch(
        `${API}/customers`,
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        token
      );

      setForm(emptyForm);
      setShowForm(false);

      await loadCustomers();

      alert("Customer added successfully");
    } catch (error: any) {
      alert(error.message);
    }
  }

  const filtered = useMemo(() => {
    return customers.filter((c) =>
      JSON.stringify(c)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage customer relationships and follow-ups."
        button="+ Add Customer"
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <Modal
          title="Add New Customer"
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={addCustomer}>
            <div className="form-grid">
              <Input
                label="Customer Name"
                value={form.name}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    name: v,
                  })
                }
              />

              <Input
                label="Mobile Number"
                value={form.mobile}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    mobile: v,
                  })
                }
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) =>
                  setForm({
                    ...form,
                    email: v,
                  })
                }
              />

              <Input
                label="Business Name"
                value={form.businessName}
                onChange={(v) =>
                  setForm({
                    ...form,
                    businessName: v,
                  })
                }
              />

              <Input
                label="GST Number"
                value={form.gstNumber}
                onChange={(v) =>
                  setForm({
                    ...form,
                    gstNumber: v,
                  })
                }
              />

              <Select
                label="Customer Type"
                value={form.customerType}
                options={[
                  "Retail",
                  "Wholesale",
                  "Distributor",
                ]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    customerType: v,
                  })
                }
              />

              <Select
                label="Status"
                value={form.status}
                options={[
                  "Lead",
                  "Active",
                  "Inactive",
                ]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    status: v,
                  })
                }
              />

              <Input
                label="Follow-up Date"
                type="date"
                value={form.followUpDate}
                onChange={(v) =>
                  setForm({
                    ...form,
                    followUpDate: v,
                  })
                }
              />

              <div className="full-width">
                <label>Address</label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="full-width">
                <label>Notes</label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <ModalActions
              cancel={() =>
                setShowForm(false)
              }
              save="Save Customer"
            />
          </form>
        </Modal>
      )}

      <div className="card">
        <div className="toolbar">
          <div className="search-wrapper">
            <span>⌕</span>

            <input
              value={search}
              placeholder="Search customers..."
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <span className="record-count">
            {filtered.length} customers
          </span>
        </div>

        <Table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Business</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c, index) => (
              <tr key={c.id || index}>
                <td>
                  <strong>
                    {c.name ||
                      c.customerName ||
                      "—"}
                  </strong>
                </td>

                <td>
                  {c.mobile ||
                    c.phone ||
                    "—"}
                </td>

                <td>{c.email || "—"}</td>

                <td>
                  {c.businessName || "—"}
                </td>

                <td>
                  <Badge type="success">
                    {c.status || "Active"}
                  </Badge>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <EmptyRow
                columns={5}
                text="No customers found"
              />
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

/* ================= PRODUCTS ================= */

function Products({
  token,
}: {
  token: string;
}) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const emptyForm = {
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "",
    minimumStockAlertQuantity: "5",
    location: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  async function loadProducts() {
    try {
      const data = await apiFetch(
        `${API}/products`,
        {},
        token
      );

      setProducts(
        getArray(data, ["products"])
      );
    } catch {
      setProducts([]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [token]);

  async function addProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await apiFetch(
        `${API}/products`,
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            unitPrice: Number(
              form.unitPrice
            ),
            currentStock: Number(
              form.currentStock
            ),
            minimumStockAlertQuantity:
              Number(
                form.minimumStockAlertQuantity
              ),
          }),
        },
        token
      );

      setForm(emptyForm);
      setShowForm(false);

      await loadProducts();

      alert("Product added successfully");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products & Inventory"
        subtitle="Manage products, pricing and current stock."
        button="+ Add Product"
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <Modal
          title="Add New Product"
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={addProduct}>
            <div className="form-grid">
              <Input
                label="Product Name"
                value={form.name}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    name: v,
                  })
                }
              />

              <Input
                label="SKU / Code"
                value={form.sku}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    sku: v,
                  })
                }
              />

              <Input
                label="Category"
                value={form.category}
                onChange={(v) =>
                  setForm({
                    ...form,
                    category: v,
                  })
                }
              />

              <Input
                label="Unit Price"
                type="number"
                value={form.unitPrice}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    unitPrice: v,
                  })
                }
              />

              <Input
                label="Current Stock"
                type="number"
                value={form.currentStock}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    currentStock: v,
                  })
                }
              />

              <Input
                label="Minimum Stock Alert"
                type="number"
                value={
                  form.minimumStockAlertQuantity
                }
                onChange={(v) =>
                  setForm({
                    ...form,
                    minimumStockAlertQuantity:
                      v,
                  })
                }
              />

              <Input
                label="Warehouse / Location"
                value={form.location}
                onChange={(v) =>
                  setForm({
                    ...form,
                    location: v,
                  })
                }
              />
            </div>

            <ModalActions
              cancel={() =>
                setShowForm(false)
              }
              save="Save Product"
            />
          </form>
        </Modal>
      )}

      <div className="card">
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, index) => {
              const stock =
                productStock(p);

              return (
                <tr key={p.id || index}>
                  <td>
                    <strong>
                      {p.name ||
                        p.productName ||
                        "—"}
                    </strong>
                  </td>

                  <td>
                    {p.sku ||
                      p.code ||
                      "—"}
                  </td>

                  <td>
                    {p.category || "—"}
                  </td>

                  <td>
                    ₹
                    {productPrice(
                      p
                    ).toLocaleString()}
                  </td>

                  <td>
                    <strong>
                      {stock}
                    </strong>
                  </td>

                  <td>
                    <Badge
                      type={
                        stock <= 5
                          ? "danger"
                          : "success"
                      }
                    >
                      {stock <= 5
                        ? "Low Stock"
                        : "In Stock"}
                    </Badge>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <EmptyRow
                columns={6}
                text="No products found"
              />
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

/* ================= STOCK MOVEMENTS ================= */

function StockMovements({
  token,
}: {
  token: string;
}) {
  const [movements, setMovements] =
    useState<Movement[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    movement_type: "IN",
    reason: "",
  });

  async function load() {
    try {
      const [movementData, productData] =
        await Promise.all([
          apiFetch(
            `${API}/stock-movements`,
            {},
            token
          ),
          apiFetch(
            `${API}/products`,
            {},
            token
          ),
        ]);

      setMovements(
        getArray(movementData, [
          "movements",
        ])
      );

      setProducts(
        getArray(productData, [
          "products",
        ])
      );
    } catch {
      setMovements([]);
      setProducts([]);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function addMovement(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !form.product_id ||
      !form.quantity
    ) {
      alert("Select product and quantity");
      return;
    }

    try {
      await apiFetch(
        `${API}/stock-movements`,
        {
          method: "POST",
          body: JSON.stringify({
            product_id: Number(
              form.product_id
            ),
            quantity: Number(
              form.quantity
            ),
            movement_type:
              form.movement_type,
            reason: form.reason,
          }),
        },
        token
      );

      setForm({
        product_id: "",
        quantity: "",
        movement_type: "IN",
        reason: "",
      });

      setShowForm(false);

      await load();

      alert(
        "Stock movement recorded successfully"
      );
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock Movements"
        subtitle="Track inventory IN and OUT movements."
        button="+ Add Movement"
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <Modal
          title="New Stock Movement"
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={addMovement}>
            <div className="form-grid">
              <Select
                label="Product"
                value={form.product_id}
                options={[
                  "",
                  ...products.map(
                    (p) =>
                      `${p.id}|${
                        p.name ||
                        p.productName ||
                        "Product"
                      }`
                  ),
                ]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    product_id:
                      v.split("|")[0],
                  })
                }
              />

              <Input
                label="Quantity"
                type="number"
                value={form.quantity}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    quantity: v,
                  })
                }
              />

              <Select
                label="Movement Type"
                value={
                  form.movement_type
                }
                options={["IN", "OUT"]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    movement_type: v,
                  })
                }
              />

              <Input
                label="Reason"
                value={form.reason}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    reason: v,
                  })
                }
              />
            </div>

            <ModalActions
              cancel={() =>
                setShowForm(false)
              }
              save="Record Movement"
            />
          </form>
        </Modal>
      )}

      <div className="card">
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((m, index) => {
              const type =
                m.movement_type ||
                m.movementType ||
                "";

              return (
                <tr key={m.id || index}>
                  <td>
                    <strong>
                      {m.product_name ||
                        m.productName ||
                        m.product_id ||
                        m.productId ||
                        "—"}
                    </strong>
                  </td>

                  <td>
                    {m.quantity || 0}
                  </td>

                  <td>
                    <Badge
                      type={
                        type === "OUT"
                          ? "danger"
                          : "success"
                      }
                    >
                      {type || "—"}
                    </Badge>
                  </td>

                  <td>
                    {m.reason || "—"}
                  </td>

                  <td>
                    {formatDate(
                      m.created_at ||
                        m.createdAt
                    )}
                  </td>
                </tr>
              );
            })}

            {movements.length === 0 && (
              <EmptyRow
                columns={5}
                text="No stock movements found"
              />
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

/* ================= CHALLANS ================= */

function Challans({
  token,
}: {
  token: string;
}) {
  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [items, setItems] = useState<
    {
      product_id: string;
      quantity: string;
    }[]
  >([
    {
      product_id: "",
      quantity: "",
    },
  ]);

  async function load() {
    try {
      const [
        challanData,
        customerData,
        productData,
      ] = await Promise.all([
        apiFetch(
          `${API}/challans`,
          {},
          token
        ),
        apiFetch(
          `${API}/customers`,
          {},
          token
        ),
        apiFetch(
          `${API}/products`,
          {},
          token
        ),
      ]);

      setChallans(
        getArray(challanData, [
          "challans",
        ])
      );

      setCustomers(
        getArray(customerData, [
          "customers",
        ])
      );

      setProducts(
        getArray(productData, [
          "products",
        ])
      );
    } catch {
      setChallans([]);
      setCustomers([]);
      setProducts([]);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(
      items.filter(
        (_, i) => i !== index
      )
    );
  }

  function updateItem(
    index: number,
    field: "product_id" | "quantity",
    value: string
  ) {
    setItems(
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  async function createChallan(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!customerId) {
      alert("Select a customer");
      return;
    }

    const validItems = items.filter(
      (i) =>
        i.product_id &&
        Number(i.quantity) > 0
    );

    if (!validItems.length) {
      alert(
        "Add at least one product"
      );
      return;
    }

    try {
      /*
       * Try the most useful payload first.
       * Backend can validate stock and reject
       * negative-stock transactions.
       */
      const payload = {
        customer_id: Number(customerId),
        items: validItems.map((i) => ({
          product_id: Number(
            i.product_id
          ),
          quantity: Number(
            i.quantity
          ),
        })),
        status: "CONFIRMED",
      };

      let created: any;

      try {
        created = await apiFetch(
          `${API}/challans`,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          },
          token
        );
      } catch {
        /*
         * Fallback for backends that expect
         * a draft first.
         */
        created = await apiFetch(
          `${API}/challans`,
          {
            method: "POST",
            body: JSON.stringify({
              customer_id:
                Number(customerId),
              items: validItems.map(
                (i) => ({
                  product_id:
                    Number(
                      i.product_id
                    ),
                  quantity: Number(
                    i.quantity
                  ),
                })
              ),
            }),
          },
          token
        );

        const id =
          created?.id ||
          created?.challan?.id ||
          created?.data?.id;

        if (id) {
          try {
            await apiFetch(
              `${API}/challans/${id}/confirm`,
              {
                method: "POST",
              },
              token
            );
          } catch {
            try {
              await apiFetch(
                `${API}/challans/${id}/confirm`,
                {
                  method: "PATCH",
                },
                token
              );
            } catch {
              // backend may already confirm automatically
            }
          }
        }
      }

      setCustomerId("");

      setItems([
        {
          product_id: "",
          quantity: "",
        },
      ]);

      setShowForm(false);

      await load();

      alert(
        "Sales challan created successfully"
      );
    } catch (error: any) {
      alert(
        error.message ||
          "Unable to create challan"
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        subtitle="Create and manage sales challans."
        button="+ Create Challan"
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <Modal
          title="Create Sales Challan"
          onClose={() =>
            setShowForm(false)
          }
        >
          <form onSubmit={createChallan}>
            <div className="form-grid">
              <Select
                label="Customer"
                value={customerId}
                options={[
                  "",
                  ...customers.map(
                    (c) =>
                      `${c.id}|${
                        c.name ||
                        c.customerName ||
                        "Customer"
                      }`
                  ),
                ]}
                onChange={(v) =>
                  setCustomerId(
                    v.split("|")[0]
                  )
                }
              />
            </div>

            <div
              style={{
                marginTop: 20,
              }}
            >
              <div
                className="card-title-row"
              >
                <div>
                  <h3>
                    Products
                  </h3>

                  <p>
                    Add products and
                    quantities
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addItem}
                >
                  + Add Product
                </button>
              </div>

              {items.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 120px 40px",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <select
                      value={
                        item.product_id
                      }
                      onChange={(e) =>
                        updateItem(
                          index,
                          "product_id",
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map(
                        (p) => (
                          <option
                            key={p.id}
                            value={p.id}
                          >
                            {p.name ||
                              p.productName}{" "}
                            — Stock:{" "}
                            {productStock(
                              p
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={
                        item.quantity
                      }
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>

            <ModalActions
              cancel={() =>
                setShowForm(false)
              }
              save="Create & Confirm"
            />
          </form>
        </Modal>
      )}

      <div className="card">
        <Table>
          <thead>
            <tr>
              <th>Challan Number</th>
              <th>Customer</th>
              <th>Total Quantity</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {challans.map((c, index) => (
              <tr key={c.id || index}>
                <td>
                  <strong>
                    {c.challan_number ||
                      c.challanNumber ||
                      "—"}
                  </strong>
                </td>

                <td>
                  {c.customer_name ||
                    c.customerName ||
                    c.customer_id ||
                    "—"}
                </td>

                <td>
                  {c.total_quantity ??
                    c.totalQuantity ??
                    0}
                </td>

                <td>
                  <Badge
                    type={
                      c.status ===
                      "CONFIRMED"
                        ? "success"
                        : "neutral"
                    }
                  >
                    {c.status ||
                      "Draft"}
                  </Badge>
                </td>

                <td>
                  {formatDate(
                    c.created_at ||
                      c.createdAt
                  )}
                </td>
              </tr>
            ))}

            {challans.length === 0 && (
              <EmptyRow
                columns={5}
                text="No challans found"
              />
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

/* ================= USERS ================= */

function Users({
  token,
}: {
  token: string;
}) {
  const [users, setUsers] =
    useState<User[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES",
  });

  async function loadUsers() {
    try {
      const data = await apiFetch(
        `${API}/users`,
        {},
        token
      );

      setUsers(
        getArray(data, ["users"])
      );
    } catch {
      setUsers([]);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  async function createUser(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await apiFetch(
        `${API}/users`,
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        token
      );

      setForm({
        name: "",
        email: "",
        password: "",
        role: "SALES",
      });

      setShowForm(false);

      await loadUsers();

      alert("User created successfully");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Users & Access"
        subtitle="Manage ERP users and their roles."
        button="+ Create User"
        onClick={() => setShowForm(true)}
      />

      {showForm && (
        <Modal
          title="Create User"
          onClose={() =>
            setShowForm(false)
          }
        >
          <form onSubmit={createUser}>
            <div className="form-grid">
              <Input
                label="Name"
                value={form.name}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    name: v,
                  })
                }
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    email: v,
                  })
                }
              />

              <Input
                label="Password"
                type="password"
                value={form.password}
                required
                onChange={(v) =>
                  setForm({
                    ...form,
                    password: v,
                  })
                }
              />

              <Select
                label="Role"
                value={form.role}
                options={[
                  "ADMIN",
                  "SALES",
                  "WAREHOUSE",
                  "ACCOUNTS",
                ]}
                onChange={(v) =>
                  setForm({
                    ...form,
                    role: v,
                  })
                }
              />
            </div>

            <ModalActions
              cancel={() =>
                setShowForm(false)
              }
              save="Create User"
            />
          </form>
        </Modal>
      )}

      <div className="card">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => (
              <tr key={u.id || index}>
                <td>
                  <strong>
                    {u.name || "—"}
                  </strong>
                </td>

                <td>{u.email || "—"}</td>

                <td>
                  <Badge type="neutral">
                    {u.role || "—"}
                  </Badge>
                </td>

                <td>
                  {formatDate(
                    u.created_at ||
                      u.createdAt
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <EmptyRow
                columns={4}
                text="No users found"
              />
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

/* ================= REPORTS ================= */

function Reports({
  token,
}: {
  token: string;
}) {
  const [sales, setSales] =
    useState<any[]>([]);

  const [lowStock, setLowStock] =
    useState<any[]>([]);

  const [movements, setMovements] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [
          salesData,
          lowStockData,
          movementData,
        ] = await Promise.all([
          apiFetch(
            `${API}/reports/sales`,
            {},
            token
          ),

          apiFetch(
            `${API}/reports/low-stock`,
            {},
            token
          ),

          apiFetch(
            `${API}/reports/stock-movements`,
            {},
            token
          ),
        ]);

        setSales(
          getArray(salesData, [
            "report",
            "sales",
          ])
        );

        setLowStock(
          getArray(lowStockData, [
            "products",
          ])
        );

        setMovements(
          getArray(movementData, [
            "movements",
          ])
        );
      } catch {
        setSales([]);
        setLowStock([]);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Monitor sales, inventory and stock activity."
      />

      <div className="content-summary">
        <div className="summary-card">
          <div className="summary-icon">
            ▤
          </div>

          <div>
            <span>Sales Challans</span>
            <strong>
              {loading
                ? "..."
                : sales.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon warning">
            !
          </div>

          <div>
            <span>Low Stock</span>
            <strong>
              {loading
                ? "..."
                : lowStock.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ↕
          </div>

          <div>
            <span>Movements</span>
            <strong>
              {loading
                ? "..."
                : movements.length}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title-row">
            <div>
              <h3>Low Stock Report</h3>
              <p>
                Products below threshold
              </p>
            </div>
          </div>

          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>
              {lowStock.map(
                (p, index) => (
                  <tr
                    key={
                      p.id || index
                    }
                  >
                    <td>
                      <strong>
                        {p.name ||
                          p.productName ||
                          "—"}
                      </strong>
                    </td>

                    <td>
                      {p.sku || "—"}
                    </td>

                    <td>
                      <Badge type="danger">
                        {p.current_stock ??
                          p.currentStock ??
                          0}
                      </Badge>
                    </td>
                  </tr>
                )
              )}

              {lowStock.length === 0 && (
                <EmptyRow
                  columns={3}
                  text="No low-stock products"
                />
              )}
            </tbody>
          </Table>
        </div>

        <div className="card">
          <div className="card-title-row">
            <div>
              <h3>Recent Sales</h3>
              <p>
                Latest sales challans
              </p>
            </div>
          </div>

          <Table>
            <thead>
              <tr>
                <th>Challan</th>
                <th>Customer</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {sales
                .slice(0, 8)
                .map((s, index) => (
                  <tr
                    key={
                      s.id || index
                    }
                  >
                    <td>
                      <strong>
                        {s.challan_number ||
                          s.challanNumber ||
                          "—"}
                      </strong>
                    </td>

                    <td>
                      {s.customer_name ||
                        s.customerName ||
                        "—"}
                    </td>

                    <td>
                      {formatDate(
                        s.created_at ||
                          s.createdAt
                      )}
                    </td>
                  </tr>
                ))}

              {sales.length === 0 && (
                <EmptyRow
                  columns={3}
                  text="No sales records"
                />
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function PageHeader({
  title,
  subtitle,
  button,
  onClick,
}: {
  title: string;
  subtitle: string;
  button?: string;
  onClick?: () => void;
}) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {button && (
        <button
          className="primary-button"
          onClick={onClick}
        >
          {button}
        </button>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>
              Enter the required information below.
            </p>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({
  cancel,
  save,
}: {
  cancel: () => void;
  save: string;
}) {
  return (
    <div className="modal-actions">
      <button
        type="button"
        className="secondary-button"
        onClick={cancel}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="primary-button"
      >
        {save}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label>{label}</label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {options.map((option) => {
          const [id, name] =
            option.split("|");

          return (
            <option
              key={option}
              value={
                option.includes("|")
                  ? option
                  : option
              }
            >
              {option.includes("|")
                ? name
                : option || "Select"}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function Badge({
  type = "neutral",
  children,
}: {
  type?:
    | "success"
    | "danger"
    | "neutral";
  children: React.ReactNode;
}) {
  return (
    <span className={`badge ${type}`}>
      {children}
    </span>
  );
}

function Table({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="table-container">
      <table>{children}</table>
    </div>
  );
}

function EmptyRow({
  columns,
  text,
}: {
  columns: number;
  text: string;
}) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="empty-row"
      >
        <div className="empty-icon">
          ⌁
        </div>

        <strong>{text}</strong>

        <span>
          There is currently no data
          to display.
        </span>
      </td>
    </tr>
  );
}

export default App;