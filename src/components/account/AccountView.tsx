"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Plus, Pencil, LogOut,
  User, CreditCard, Bell, ShieldCheck,
  Home, Package, Heart, UserCircle, MapPin,
} from "lucide-react";
import { useSessionStore } from "@/store/session";

type OrderItem = {
  product: { name: string; images: string[] };
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  total: string;
  items: OrderItem[];
};

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const SETTINGS = [
  { label: "Personal Information", icon: User },
  { label: "Payment Methods", icon: CreditCard },
  { label: "Notifications", icon: Bell },
  { label: "Security & Privacy", icon: ShieldCheck },
];

const BOTTOM_NAV = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Orders", icon: Package, href: "/account/orders" },
  { label: "Wishlist", icon: Heart, href: "/account/wishlist" },
  { label: "Account", icon: UserCircle, href: "/account", active: true },
];

const DESKTOP_NAV = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Payment Methods", href: "/account/payment" },
  { label: "Settings", href: "/account/settings" },
];

/* ── Skeleton primitives ── */
function Shimmer({ className }: { className: string }) {
  return <div className={`bg-outline/10 animate-pulse rounded-[3px] ${className}`} />;
}

function OrderSkeletonSm() {
  return (
    <div className="bg-surface-lowest rounded-[4px] p-4">
      <div className="flex items-center justify-between mb-3">
        <Shimmer className="h-2.5 w-24" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-3 w-40 mb-4" />
      <div className="flex items-center gap-3">
        <div className="w-14 flex-shrink-0 rounded-[4px] bg-outline/10 animate-pulse" style={{ aspectRatio: "4/5" }} />
        <div className="flex-1 flex flex-col gap-2">
          <Shimmer className="h-2 w-14" />
          <Shimmer className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

function OrderSkeletonLg() {
  return (
    <div className="bg-surface-lowest rounded-[4px] p-5 flex items-center gap-5">
      <div className="w-16 flex-shrink-0 rounded-[4px] bg-outline/10 animate-pulse" style={{ aspectRatio: "4/5" }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex gap-3">
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="h-4 w-16 rounded-full" />
        </div>
        <Shimmer className="h-3 w-44" />
        <Shimmer className="h-2 w-32" />
      </div>
    </div>
  );
}

function AddressSkeletonSm() {
  return (
    <div className="bg-surface-low rounded-[4px] p-4 border-l-2 border-outline/10">
      <Shimmer className="h-2 w-20 mb-3" />
      <Shimmer className="h-3 w-32 mb-2" />
      <Shimmer className="h-2.5 w-48 mb-1.5" />
      <Shimmer className="h-2.5 w-36 mb-1.5" />
      <Shimmer className="h-2.5 w-24" />
    </div>
  );
}

function AddressSkeletonLg() {
  return (
    <div className="bg-surface-low rounded-[4px] p-5 border-l-2 border-outline/10">
      <Shimmer className="h-2 w-24 mb-3" />
      <Shimmer className="h-3 w-36 mb-2" />
      <Shimmer className="h-2.5 w-52 mb-1.5" />
      <Shimmer className="h-2.5 w-40 mb-1.5" />
      <Shimmer className="h-2.5 w-28" />
    </div>
  );
}

/* ── Empty states ── */
function OrdersEmpty() {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-[4px] bg-surface-low flex items-center justify-center mb-4">
        <Package size={20} strokeWidth={1.5} className="text-on-surface-faint" />
      </div>
      <p
        className="text-lg text-on-surface mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Nothing here yet
      </p>
      <p className="text-xs text-on-surface-faint mb-5 max-w-[220px] leading-relaxed">
        Your orders will appear here once you shop the atelier.
      </p>
      <Link
        href="/collections"
        className="btn-ghost text-xs h-9 px-6 flex items-center gap-1.5"
      >
        Shop Now <ChevronRight size={12} />
      </Link>
    </div>
  );
}

function AddressEmpty({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "py-6 px-2" : "py-8 px-4"}`}>
      <div className="w-10 h-10 rounded-[4px] bg-surface-low flex items-center justify-center mb-3">
        <MapPin size={16} strokeWidth={1.5} className="text-on-surface-faint" />
      </div>
      <p
        className="text-base text-on-surface mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        No address saved
      </p>
      <p className="text-xs text-on-surface-faint mb-4 max-w-[200px] leading-relaxed">
        Add a shipping address to speed up checkout.
      </p>
      <button className="btn-ghost text-xs h-9 px-5 flex items-center gap-1.5">
        <Plus size={12} /> Add Address
      </button>
    </div>
  );
}

/* ── Order cards ── */
function OrderCardSm({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const image = firstItem?.product.images[0];
  const label = firstItem?.product.name ?? "Order";
  const status = STATUS_LABEL[order.status] ?? order.status;

  return (
    <div className="bg-surface-lowest rounded-[4px] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="label text-primary">Order #{order.id.slice(-6).toUpperCase()}</span>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-container text-primary font-medium uppercase tracking-wide">
          {status}
        </span>
      </div>
      <p className="text-sm font-medium text-on-surface mb-3">{label}</p>
      <div className="flex items-center gap-3">
        <div className="relative w-14 aspect-[4/5] rounded-[4px] overflow-hidden bg-surface-low flex-shrink-0">
          {image && <Image src={image} alt={label} fill className="object-cover object-top" sizes="56px" />}
        </div>
        <div className="flex-1">
          <p className="text-xs text-on-surface-faint mb-0.5">Placed</p>
          <p className="text-sm font-semibold text-on-surface">
            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>
        <ChevronRight size={16} className="text-on-surface-faint" />
      </div>
    </div>
  );
}

function OrderCardLg({ order }: { order: Order }) {
  const firstItem = order.items[0];
  const image = firstItem?.product.images[0];
  const label = firstItem?.product.name ?? "Order";
  const status = STATUS_LABEL[order.status] ?? order.status;

  return (
    <div className="bg-surface-lowest rounded-[4px] p-5 flex items-center gap-5">
      <div className="relative w-16 aspect-[4/5] rounded-[4px] overflow-hidden bg-surface-low flex-shrink-0">
        {image && <Image src={image} alt={label} fill className="object-cover object-top" sizes="64px" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="label text-primary">Order #{order.id.slice(-6).toUpperCase()}</span>
          <span className="text-[10px] px-2.5 py-0.5 bg-primary-container text-primary rounded-full font-medium uppercase tracking-wide">
            {status}
          </span>
        </div>
        <p className="text-sm font-medium text-on-surface mb-1">{label}</p>
        <p className="text-xs text-on-surface-faint">
          Placed{" "}
          <span className="text-on-surface-muted font-medium">
            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </p>
      </div>
      <ChevronRight size={16} className="text-on-surface-faint" />
    </div>
  );
}

/* ── Main view ── */
export function AccountView() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const sessionUser = useSessionStore((s) => s.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = sessionUser?.name?.split(" ")[0] ?? "";
  const displayInitial = firstName[0] ?? "A";

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        if (data.addresses) setAddresses(data.addresses);
        if (!sessionUser) {
          fetch("/api/auth/me")
            .then((r) => r.json())
            .then((d) => { if (d.user) setUser(d.user); });
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return (
    <div className="bg-surface min-h-screen">

      {/* ── Mobile layout ── */}
      <div className="md:hidden px-5 pt-8 pb-28">
        <p className="label text-on-surface-faint mb-2">My Atelier</p>
        <h1
          className="text-3xl text-on-surface mb-10"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>

        {/* Recent Orders */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>Recent Orders</h2>
            <Link href="/account/orders" className="label text-on-surface-faint hover:text-primary transition-colors">View All</Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              <OrderSkeletonSm />
            </div>
          ) : orders.length === 0 ? (
            <OrdersEmpty />
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => <OrderCardSm key={order.id} order={order} />)}
            </div>
          )}
        </section>

        {/* Shipping Addresses */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>Shipping Addresses</h2>
            <button className="w-8 h-8 flex items-center justify-center text-on-surface-muted hover:text-primary transition-colors">
              <Plus size={18} />
            </button>
          </div>
          {loading ? (
            <AddressSkeletonSm />
          ) : defaultAddress ? (
            <div className="bg-surface-low rounded-[4px] p-4 border-l-2 border-primary/40 relative">
              <button className="absolute top-4 right-4 text-on-surface-faint hover:text-primary transition-colors">
                <Pencil size={14} />
              </button>
              {defaultAddress.isDefault && (
                <p className="label text-on-surface-faint mb-2">Default Address</p>
              )}
              <p className="text-sm font-semibold text-on-surface mb-1">{sessionUser?.name}</p>
              <p className="text-sm text-on-surface-muted">{defaultAddress.line1}</p>
              {defaultAddress.line2 && <p className="text-sm text-on-surface-muted">{defaultAddress.line2}</p>}
              <p className="text-sm text-on-surface-muted">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
              <p className="text-sm text-on-surface-muted">{defaultAddress.country}</p>
            </div>
          ) : (
            <AddressEmpty />
          )}
        </section>

        {/* Account Settings */}
        <section className="mb-10">
          <h2 className="text-xl text-on-surface mb-4" style={{ fontFamily: "var(--font-serif)" }}>Account Settings</h2>
          <div className="flex flex-col">
            {SETTINGS.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                className={`flex items-center gap-4 py-4 text-left ${i < SETTINGS.length - 1 ? "border-b border-outline/10" : ""}`}
              >
                <span className="w-8 h-8 flex items-center justify-center bg-surface-low rounded-[4px] flex-shrink-0">
                  <Icon size={15} strokeWidth={1.5} className="text-on-surface-muted" />
                </span>
                <span className="flex-1 text-sm text-on-surface">{label}</span>
                <ChevronRight size={15} className="text-on-surface-faint" />
              </button>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 flex items-center justify-center gap-2 bg-secondary text-white rounded-[4px] text-xs tracking-widest uppercase"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-outline/10 z-40">
        <div className="grid grid-cols-4">
          {BOTTOM_NAV.map(({ label, icon: Icon, href, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active ? "text-primary" : "text-on-surface-faint hover:text-on-surface"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide uppercase">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-[220px_1fr] gap-12">

          {/* Sidebar */}
          <aside>
            <div className="mb-8">
              {loading ? (
                <div className="mb-3">
                  <Shimmer className="w-14 h-14 rounded-[4px] mb-3" />
                  <Shimmer className="h-3.5 w-32 mb-1.5" />
                  <Shimmer className="h-2.5 w-40" />
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-[4px] bg-primary-container flex items-center justify-center mb-3">
                    <span className="text-2xl font-serif text-primary">{displayInitial}</span>
                  </div>
                  <p className="text-base font-semibold text-on-surface">{sessionUser?.name ?? "—"}</p>
                  <p className="text-xs text-on-surface-faint">{sessionUser?.email ?? "—"}</p>
                </>
              )}
            </div>
            <nav className="flex flex-col gap-1">
              {DESKTOP_NAV.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`px-3 py-2.5 text-sm rounded-[4px] transition-colors ${
                    href === "/account"
                      ? "bg-primary-container text-primary font-medium"
                      : "text-on-surface-muted hover:text-on-surface hover:bg-surface-low"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-on-surface-faint hover:text-primary transition-colors mt-4"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div>
            <p className="label text-on-surface-faint mb-2">My Atelier</p>
            <h1
              className="text-4xl text-on-surface mb-10"
              style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
            >
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>

            {/* Recent Orders */}
            <section className="mb-12">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>Recent Orders</h2>
                <Link href="/account/orders" className="label text-on-surface-faint hover:text-primary transition-colors">View All</Link>
              </div>
              {loading ? (
                <div className="flex flex-col gap-3">
                  <OrderSkeletonLg />
                  <OrderSkeletonLg />
                </div>
              ) : orders.length === 0 ? (
                <OrdersEmpty />
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => <OrderCardLg key={order.id} order={order} />)}
                </div>
              )}
            </section>

            {/* Addresses + Settings side-by-side */}
            <div className="grid grid-cols-2 gap-8">
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="text-2xl text-on-surface" style={{ fontFamily: "var(--font-serif)" }}>Addresses</h2>
                  <button className="text-on-surface-faint hover:text-primary transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                {loading ? (
                  <AddressSkeletonLg />
                ) : defaultAddress ? (
                  <div className="bg-surface-low rounded-[4px] p-5 border-l-2 border-primary/40 relative">
                    <button className="absolute top-4 right-4 text-on-surface-faint hover:text-primary transition-colors">
                      <Pencil size={13} />
                    </button>
                    {defaultAddress.isDefault && (
                      <p className="label text-on-surface-faint mb-2">Default Address</p>
                    )}
                    <p className="text-sm font-semibold text-on-surface mb-1">{sessionUser?.name}</p>
                    <p className="text-sm text-on-surface-muted">{defaultAddress.line1}</p>
                    {defaultAddress.line2 && <p className="text-sm text-on-surface-muted">{defaultAddress.line2}</p>}
                    <p className="text-sm text-on-surface-muted">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                    <p className="text-sm text-on-surface-muted">{defaultAddress.country}</p>
                  </div>
                ) : (
                  <AddressEmpty compact />
                )}
              </section>

              <section>
                <h2 className="text-2xl text-on-surface mb-5" style={{ fontFamily: "var(--font-serif)" }}>Settings</h2>
                <div className="flex flex-col bg-surface-lowest rounded-[4px] overflow-hidden">
                  {SETTINGS.map(({ label, icon: Icon }, i) => (
                    <button
                      key={label}
                      className={`flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-low transition-colors ${
                        i < SETTINGS.length - 1 ? "border-b border-outline/10" : ""
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.5} className="text-on-surface-faint flex-shrink-0" />
                      <span className="flex-1 text-sm text-on-surface">{label}</span>
                      <ChevronRight size={13} className="text-on-surface-faint" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
