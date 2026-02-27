"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from "@/modules/profile/profile.service";
import {
  useAddressListQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  usePaymentGatewaysQuery,
} from "@/modules/checkout/checkout.service";
import type { CustomerAddress, PaymentGateway } from "@/modules/checkout/checkout.type";
import {
  useOrderListQuery,
  useCancelOrderMutation,
} from "@/modules/order/order.service";
import type { Order, OrderStatus } from "@/modules/order/order.type";
import {
  useTicketListQuery,
  useTicketMessagesQuery,
  useCreateTicketMutation,
  useAddMessageMutation,
  useResolveTicketMutation,
} from "@/modules/support/support.service";
import type { SupportTicket, TicketMessage } from "@/modules/support/support.type";
import { useWishlistQuery, useWishlistRemoveMutation } from "@/modules/wishlist/wishlist.service";
import {
  useWalletInfoQuery,
  useWalletTransactionsQuery,
  useWalletDepositMutation,
  useWalletStripeSessionMutation,
  useWalletIyzicoSessionMutation,
} from "@/modules/wallet/wallet.service";
import type { WalletTransaction } from "@/modules/wallet/wallet.type";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { useAreaListQuery } from "@/modules/area/area.service";
import { usePrice } from "@/hooks/use-price";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from "@/modules/profile/profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  User,
  Lock,
  MapPin,
  Loader2,
  Check,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Package,
  Headphones,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  X,
  MessageSquare,
  ArrowLeft,
  Send,
  CheckCircle,
  Search,
  LogOut,
  Heart,
  Clock,
  Star,
  Wallet,
  CreditCard,
  Banknote,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY, AUTH_USER } from "@/lib/constants";

const SUPPORTED_WALLET_GATEWAYS = new Set(["stripe", "iyzico"]);

const walletGatewayIconMap: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  iyzico: CreditCard,
  paytr: CreditCard,
  moka: CreditCard,
  bank_transfer: Banknote,
};

interface Props {
  translations: Record<string, string>;
}

type Tab = "profile" | "orders" | "wishlist" | "recently_viewed" | "support" | "addresses" | "password" | "wallet";

export function AccountClient({ translations: t }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "office" | "others",
    title: "",
    email: "",
    contact_number: "",
    address: "",
    area_id: undefined as number | undefined,
    road: "",
    house: "",
    floor: "",
    postal_code: "",
  });

  // Orders state
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");
  const [orderSearch, setOrderSearch] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  // Support state
  const [supportView, setSupportView] = useState<"list" | "create" | "conversation">("list");
  const [supportPage, setSupportPage] = useState(1);
  const [supportStatusFilter, setSupportStatusFilter] = useState<string>("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [createTicketForm, setCreateTicketForm] = useState({
    title: "",
    subject: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    department_id: 1,
  });

  // Wallet state
  const [walletPage, setWalletPage] = useState(1);
  const [walletTypeFilter, setWalletTypeFilter] = useState<"" | "credit" | "debit">("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositProcessing, setDepositProcessing] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState(false);
  const [selectedWalletGateway, setSelectedWalletGateway] = useState<string>("");
  const [bankTransferPending, setBankTransferPending] = useState(false);

  // Queries
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfileQuery();
  const { data: addresses, isLoading: addressesLoading } =
    useAddressListQuery();
  const { data: areas } = useAreaListQuery();

  // Order queries & mutations
  const { data: ordersData, isLoading: ordersLoading } = useOrderListQuery({
    page: orderPage,
    status: orderStatusFilter || undefined,
    search: orderSearch || undefined,
  });
  const cancelOrderMutation = useCancelOrderMutation();

  // Support queries & mutations
  const { data: ticketsData, isLoading: ticketsLoading } = useTicketListQuery({
    page: supportPage,
    status: supportStatusFilter || undefined,
  });
  const { data: ticketMessages, isLoading: messagesLoading } =
    useTicketMessagesQuery(selectedTicketId);
  const createTicketMutation = useCreateTicketMutation();
  const addTicketMessageMutation = useAddMessageMutation();
  const resolveTicketMutation = useResolveTicketMutation();

  // Wishlist
  const [wishlistPage, setWishlistPage] = useState(1);
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlistQuery(wishlistPage);
  const wishlistRemoveMutation = useWishlistRemoveMutation();

  // Wallet queries
  const { data: walletData, refetch: refetchWallet } = useWalletInfoQuery();
  const { data: walletTxData, isLoading: walletTxLoading } = useWalletTransactionsQuery({
    page: walletPage,
    type: walletTypeFilter || undefined,
  });
  const walletDepositMutation = useWalletDepositMutation();
  const walletStripeMutation = useWalletStripeSessionMutation();
  const walletIyzicoMutation = useWalletIyzicoSessionMutation();
  const { data: paymentGateways, isLoading: gatewaysLoading } = usePaymentGatewaysQuery();

  const walletGateways = useMemo(() => {
    const apiGateways = (paymentGateways ?? []).filter((gw) => SUPPORTED_WALLET_GATEWAYS.has(gw.slug));
    const bankTransfer: PaymentGateway = {
      id: 0,
      value: "bank_transfer",
      label: "Banka Havalesi / EFT",
      name: "Banka Havalesi / EFT",
      slug: "bank_transfer",
      image: "",
      image_url: "",
      description: "Banka hesabına havale yapın, admin onayladıktan sonra bakiyenize yansır.",
    };
    return [...apiGateways, bankTransfer];
  }, [paymentGateways]);

  // Recently viewed
  const recentlyViewedItems = useRecentlyViewedStore((s) => s.items);
  const clearRecentlyViewed = useRecentlyViewedStore((s) => s.clearAll);

  // Price formatting
  const { formatPrice } = usePrice();
  const [mounted, setMounted] = useState(false);

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const addAddressMutation = useAddAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs: Tab[] = ["profile", "orders", "wishlist", "recently_viewed", "support", "addresses", "password", "wallet"];
    if (tab && validTabs.includes(tab as Tab)) {
      setActiveTab(tab as Tab);
    }
    if (searchParams.get("wallet_success") === "1") {
      setWalletSuccess(true);
      refetchWallet();
    }
  }, [searchParams]);

  // Auto-select first available wallet gateway
  useEffect(() => {
    const validSlugs = new Set(walletGateways.map((gw) => gw.slug));
    if (!walletGateways.length) {
      if (selectedWalletGateway) setSelectedWalletGateway("");
      return;
    }
    if (!selectedWalletGateway || !validSlugs.has(selectedWalletGateway)) {
      setSelectedWalletGateway(walletGateways[0].slug);
    }
  }, [walletGateways, selectedWalletGateway]);

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? {
          first_name: profile.first_name,
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          birth_day: profile.birth_day || "",
          gender: profile.gender || undefined,
        }
      : undefined,
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const handleProfileSubmit = (data: UpdateProfileFormData) => {
    setProfileSuccess(false);
    updateProfileMutation.mutate(data, {
      onSuccess: () => setProfileSuccess(true),
    });
  };

  const handlePasswordSubmit = (data: ChangePasswordFormData) => {
    setPasswordSuccess(false);
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        setPasswordSuccess(true);
        passwordForm.reset();
      },
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        Cookies.remove(AUTH_TOKEN_KEY);
        Cookies.remove(AUTH_USER);
        router.push(`/${locale}`);
      },
    });
  };

  const handleLogout = () => {
    logout();
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(AUTH_USER);
    localStorage.removeItem("expires_at");
    router.push(`/${locale}/giris`);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressSuccess(false);
    setAddressForm({
      type: "home",
      title: "",
      email: "",
      contact_number: "",
      address: "",
      area_id: undefined,
      road: "",
      house: "",
      floor: "",
      postal_code: "",
    });
  };

  const handleEditAddress = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      type: (addr.type as "home" | "office" | "others") || "home",
      title: addr.title || "",
      email: addr.email || "",
      contact_number: addr.contact_number || "",
      address: addr.address || "",
      area_id: addr.area_id ?? undefined,
      road: addr.road || "",
      house: addr.house || "",
      floor: addr.floor || "",
      postal_code: addr.postal_code || "",
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    setAddressSuccess(false);
    const payload: Record<string, any> = {
      ...addressForm,
      status: 1,
      is_default: !addresses || addresses.length === 0,
    };
    if (payload.area_id === undefined) delete payload.area_id;

    if (editingAddressId) {
      updateAddressMutation.mutate(
        { ...payload, id: editingAddressId } as any,
        {
          onSuccess: () => {
            resetAddressForm();
            setAddressSuccess(true);
          },
        }
      );
    } else {
      addAddressMutation.mutate(payload, {
        onSuccess: () => {
          resetAddressForm();
          setAddressSuccess(true);
        },
      });
    }
  };

  const handleDeposit = async () => {
    const wallet = walletData?.wallets;
    if (!wallet?.id || !depositAmount || Number(depositAmount) <= 0 || !selectedWalletGateway) return;
    setDepositError("");
    setDepositProcessing(true);
    setBankTransferPending(false);
    try {
      const depositResult = await walletDepositMutation.mutateAsync({
        wallet_id: wallet.id,
        amount: Number(depositAmount),
        payment_gateway: selectedWalletGateway,
        currency_code: "TRY",
      });

      if (selectedWalletGateway === "stripe") {
        const sessionResult = await walletStripeMutation.mutateAsync({
          wallet_id: wallet.id,
          wallet_history_id: depositResult.wallet_history_id,
        });
        if (sessionResult.data?.checkout_url) {
          window.location.href = sessionResult.data.checkout_url;
        }
      } else if (selectedWalletGateway === "iyzico") {
        const sessionResult = await walletIyzicoMutation.mutateAsync({
          wallet_id: wallet.id,
          wallet_history_id: depositResult.wallet_history_id,
        });
        if (sessionResult.data?.checkout_url) {
          window.location.href = sessionResult.data.checkout_url;
        }
      } else if (selectedWalletGateway === "bank_transfer") {
        // Pending bank transfer — show instructions, no redirect
        setBankTransferPending(true);
        setDepositProcessing(false);
      }
    } catch (err: any) {
      setDepositError(
        err?.response?.data?.errors?.amount?.[0] ||
        err?.response?.data?.message ||
        t.error
      );
      setDepositProcessing(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: t.profile, icon: User },
    { key: "wallet", label: t.wallet || "Cüzdan", icon: Wallet },
    { key: "orders", label: t.my_orders, icon: Package },
    { key: "wishlist", label: t.wishlist, icon: Heart },
    { key: "recently_viewed", label: t.recently_viewed, icon: Clock },
    { key: "support", label: t.support, icon: Headphones },
    { key: "addresses", label: t.addresses, icon: MapPin },
    { key: "password", label: t.change_password, icon: Lock },
  ];

  if (profileLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-4 sm:p-6 text-center">
          <p className="text-sm text-muted-foreground">{t.error}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => refetchProfile()}>
              Try Again
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              {t.logout || "Logout"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.my_account}</span>
      </nav>

      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold">
        <User className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6" />
        {t.my_account}
      </h1>

      <div className="grid gap-4 lg:gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          {/* Mobile: Dropdown Menu */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-sm"
            >
              <span className="flex items-center gap-2">
                {tabs.filter((tab) => tab.key === activeTab).map(({ key, label, icon: Icon }) => (
                  <span key={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                ))}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border bg-card shadow-xl">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                      activeTab === key
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
                <div className="border-t" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t.logout}
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Sidebar Nav */}
          <nav className="hidden lg:flex lg:flex-col gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
            <div className="my-1 border-t" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-6 text-lg font-bold">{t.profile}</h2>

              {profileSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  {t.profile_updated}
                </div>
              )}

              {updateProfileMutation.isError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(updateProfileMutation.error as any)?.response?.data
                    ?.message || t.error}
                </div>
              )}

              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.first_name}</Label>
                    <Input {...profileForm.register("first_name")} />
                    {profileForm.formState.errors.first_name && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t.last_name}</Label>
                    <Input {...profileForm.register("last_name")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <Input value={profile?.email || ""} disabled />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.phone}</Label>
                    <Input
                      type="tel"
                      {...profileForm.register("phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.birth_day}</Label>
                    <Input
                      type="date"
                      {...profileForm.register("birth_day")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.gender}</Label>
                  <Select
                    value={profileForm.watch("gender") || ""}
                    onValueChange={(v) =>
                      profileForm.setValue(
                        "gender",
                        v as "male" | "female" | "others"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.gender_male}</SelectItem>
                      <SelectItem value="female">{t.gender_female}</SelectItem>
                      <SelectItem value="others">{t.gender_others}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t.save}
                </Button>
              </form>

              {/* Delete Account */}
              <div className="mt-8 border-t pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                  {t.delete_account}
                </Button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-6 text-lg font-bold">{t.change_password}</h2>

              {passwordSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  {t.password_changed}
                </div>
              )}

              {changePasswordMutation.isError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(changePasswordMutation.error as any)?.response?.data
                    ?.message || t.error}
                </div>
              )}

              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="max-w-md space-y-4"
              >
                <div className="space-y-2">
                  <Label>{t.old_password}</Label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      {...passwordForm.register("old_password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.new_password}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("new_password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.new_password && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t.confirm_password}</Label>
                  <Input
                    type="password"
                    {...passwordForm.register("new_password_confirmation")}
                  />
                  {passwordForm.formState.errors
                    .new_password_confirmation && (
                    <p className="text-xs text-destructive">
                      {t.passwords_not_match}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t.change_password}
                </Button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.addresses}</h2>
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetAddressForm();
                      // Pre-fill email and phone from profile for new address
                      if (profile) {
                        setAddressForm((prev) => ({
                          ...prev,
                          email: profile.email || "",
                          contact_number: profile.phone || "",
                        }));
                      }
                      setShowAddressForm(true);
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t.add_address}
                  </Button>
                )}
              </div>

              {addressSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  {t.address_saved || "Adres başarıyla kaydedildi"}
                </div>
              )}

              {(addAddressMutation.isError || updateAddressMutation.isError) && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(addAddressMutation.error as any)?.response?.data?.message ||
                    (updateAddressMutation.error as any)?.response?.data?.message ||
                    t.error}
                </div>
              )}

              {addressesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.loading}
                </div>
              ) : (
                <>
                  {/* Address List */}
                  {(!addresses || addresses.length === 0) &&
                    !showAddressForm && (
                      <p className="py-8 text-center text-muted-foreground">
                        {t.no_addresses}
                      </p>
                    )}

                  {addresses && addresses.length > 0 && (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      {addresses.map((addr: CustomerAddress) => (
                        <div
                          key={addr.id}
                          className={`rounded-lg border p-4 ${
                            addr.is_default
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase">
                                {addr.type}
                              </span>
                              {addr.is_default && (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteAddressMutation.mutate(addr.id)
                                }
                                className="rounded p-1 text-muted-foreground hover:text-destructive"
                                disabled={deleteAddressMutation.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {addr.title && (
                            <p className="text-sm font-medium">{addr.title}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {addr.address}
                          </p>
                          {addr.contact_number && (
                            <p className="text-xs text-muted-foreground">
                              {addr.contact_number}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Address Form */}
                  {showAddressForm && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.address_type}</Label>
                          <Select
                            value={addressForm.type}
                            onValueChange={(v: any) =>
                              setAddressForm({ ...addressForm, type: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">
                                {t.address_type_home}
                              </SelectItem>
                              <SelectItem value="office">
                                {t.address_type_office}
                              </SelectItem>
                              <SelectItem value="others">
                                {t.address_type_others}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.address_title}</Label>
                          <Input
                            value={addressForm.title}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                title: e.target.value,
                              })
                            }
                            placeholder={t.address_title}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.address_email}</Label>
                          <Input
                            type="email"
                            value={addressForm.email}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.address_phone}</Label>
                          <Input
                            type="tel"
                            value={addressForm.contact_number}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                contact_number: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t.address_field}</Label>
                        <Textarea
                          value={addressForm.address}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              address: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      </div>

                      {/* Teslimat Bölgesi (il/ilçe için area_id) */}
                      <div className="space-y-2">
                        <Label>Teslimat Bölgesi</Label>
                        <Select
                          value={addressForm.area_id?.toString() ?? ""}
                          onValueChange={(v) =>
                            setAddressForm({
                              ...addressForm,
                              area_id: v ? Number(v) : undefined,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Bölge seçiniz..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(areas ?? []).map((area) => (
                              <SelectItem
                                key={area.id}
                                value={area.id.toString()}
                              >
                                {area.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="space-y-2">
                          <Label>{t.address_road}</Label>
                          <Input
                            value={addressForm.road}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                road: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.address_house}</Label>
                          <Input
                            value={addressForm.house}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                house: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.address_floor}</Label>
                          <Input
                            value={addressForm.floor}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                floor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.address_postal}</Label>
                          <Input
                            value={addressForm.postal_code}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                postal_code: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveAddress}
                          disabled={
                            addAddressMutation.isPending ||
                            updateAddressMutation.isPending ||
                            !addressForm.email ||
                            !addressForm.contact_number ||
                            !addressForm.address
                          }
                        >
                          {addAddressMutation.isPending ||
                          updateAddressMutation.isPending
                            ? t.loading
                            : t.save}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetAddressForm}
                        >
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-bold">{t.my_orders}</h2>

              {/* Search & Filters */}
              <div className="mb-4 space-y-3">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrderPage(1);
                    }}
                    placeholder={t.search}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "all",
                      "pending",
                      "confirmed",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ] as const
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setOrderStatusFilter(s === "all" ? "" : s);
                        setOrderPage(1);
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        (s === "all" && !orderStatusFilter) ||
                        orderStatusFilter === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s === "all"
                        ? t.filter_all
                        : t[`status_${s}`] || s}
                    </button>
                  ))}
                </div>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.no_orders}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersData.orders.map((order: Order) => {
                    const statusColorMap: Record<OrderStatus, string> = {
                      pending: "bg-yellow-100 text-yellow-800",
                      confirmed: "bg-blue-100 text-blue-800",
                      processing: "bg-indigo-100 text-indigo-800",
                      pickup: "bg-purple-100 text-purple-800",
                      shipped: "bg-cyan-100 text-cyan-800",
                      delivered: "bg-green-100 text-green-800",
                      cancelled: "bg-red-100 text-red-800",
                      on_hold: "bg-orange-100 text-orange-800",
                    };
                    return (
                      <div
                        key={order.order_id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                #{order.invoice_number}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColorMap[order.status] || "bg-gray-100 text-gray-800"}`}
                              >
                                {t[`status_${order.status}`] || order.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {order.order_date} · {order.store}
                            </p>
                          </div>
                          <p className="font-bold text-sm">
                            {t.currency}
                            {Number(order.order_amount).toFixed(2)}
                          </p>
                        </div>

                        {/* Thumbnails */}
                        {order.order_details && order.order_details.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto">
                            {order.order_details.slice(0, 4).map((detail) => (
                              <div
                                key={detail.id}
                                className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted"
                              >
                                {detail.product_image_url && (
                                  <Image
                                    src={detail.product_image_url}
                                    alt={detail.product_name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            ))}
                            {order.order_details.length > 4 && (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                                +{order.order_details.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/siparis/${order.order_id}`}>
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              {t.view_detail}
                            </Link>
                          </Button>
                          {order.status !== "cancelled" &&
                            order.status !== "delivered" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  setCancellingOrderId(order.order_id)
                                }
                                disabled={cancelOrderMutation.isPending}
                              >
                                <X className="mr-1 h-3.5 w-3.5" />
                                {t.cancel_order}
                              </Button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {(ordersData?.meta?.last_page ?? 1) > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage(orderPage - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t.previous}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {orderPage} / {ordersData?.meta?.last_page ?? 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={orderPage >= (ordersData?.meta?.last_page ?? 1)}
                    onClick={() => setOrderPage(orderPage + 1)}
                  >
                    {t.next}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-bold">{t.wishlist}</h2>

              {wishlistLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !wishlistData?.wishlist || wishlistData.wishlist.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.no_wishlist}</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistData.wishlist.map((product) => {
                      const hasDiscount =
                        product.special_price != null &&
                        product.price != null &&
                        Number(product.special_price) < Number(product.price);
                      const displayPrice = hasDiscount
                        ? Number(product.special_price)
                        : product.price != null
                          ? Number(product.price)
                          : 0;
                      return (
                        <div
                          key={product.id}
                          className="group relative flex gap-3 rounded-lg border p-3 transition-colors hover:border-primary/30"
                        >
                          <Link
                            href={`/urun/${product.slug}`}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                          >
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                —
                              </div>
                            )}
                            {product.discount_percentage > 0 && (
                              <span className="absolute left-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                                -{Math.round(product.discount_percentage)}%
                              </span>
                            )}
                          </Link>
                          <div className="flex flex-1 flex-col justify-between">
                            <Link
                              href={`/urun/${product.slug}`}
                              className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-muted-foreground">
                                {Number(product.rating).toFixed(1)} ({product.review_count})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">
                                {mounted ? formatPrice(displayPrice) : displayPrice.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {mounted ? formatPrice(Number(product.price)) : Number(product.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => wishlistRemoveMutation.mutate(product.id)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                            disabled={wishlistRemoveMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {(wishlistData?.meta?.last_page ?? 1) > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={wishlistPage <= 1}
                        onClick={() => setWishlistPage(wishlistPage - 1)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        {t.previous}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {wishlistPage} / {wishlistData?.meta?.last_page ?? 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={wishlistPage >= (wishlistData?.meta?.last_page ?? 1)}
                        onClick={() => setWishlistPage(wishlistPage + 1)}
                      >
                        {t.next}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Recently Viewed Tab */}
          {activeTab === "recently_viewed" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.recently_viewed}</h2>
                {recentlyViewedItems.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearRecentlyViewed}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {t.clear_history}
                  </Button>
                )}
              </div>

              {recentlyViewedItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.no_recently_viewed}</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recentlyViewedItems.map((item) => {
                    const hasDiscount =
                      item.special_price != null &&
                      item.price != null &&
                      item.special_price < item.price;
                    const displayPrice = hasDiscount
                      ? item.special_price!
                      : item.price ?? 0;
                    return (
                      <Link
                        key={item.id}
                        href={`/urun/${item.slug}`}
                        className="group flex gap-3 rounded-lg border p-3 transition-colors hover:border-primary/30"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                          {item.discount_percentage > 0 && (
                            <span className="absolute left-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                              -{Math.round(item.discount_percentage)}%
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <span className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-muted-foreground">
                              {Number(item.rating).toFixed(1)} ({item.review_count})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {mounted ? formatPrice(displayPrice) : displayPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-muted-foreground line-through">
                                {mounted ? formatPrice(item.price!) : item.price!.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              {/* LIST */}
              {supportView === "list" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">{t.support}</h2>
                    <Button
                      size="sm"
                      onClick={() => setSupportView("create")}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      {t.new_ticket}
                    </Button>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4 flex gap-2">
                    {["", "1", "0"].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSupportStatusFilter(s);
                          setSupportPage(1);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          supportStatusFilter === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {s === ""
                          ? t.filter_all
                          : s === "1"
                            ? t.status_open
                            : t.status_closed}
                      </button>
                    ))}
                  </div>

                  {ticketsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !ticketsData?.tickets ||
                    ticketsData.tickets.length === 0 ? (
                    <div className="py-12 text-center">
                      <Headphones className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">{t.no_tickets}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ticketsData.tickets.map((ticket: SupportTicket) => {
                        const priorityColorMap: Record<string, string> = {
                          urgent: "bg-red-100 text-red-800",
                          high: "bg-orange-100 text-orange-800",
                          medium: "bg-blue-100 text-blue-800",
                          low: "bg-gray-100 text-gray-800",
                        };
                        return (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {ticket.title}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColorMap[ticket.priority] || "bg-gray-100 text-gray-800"}`}
                                >
                                  {t[`priority_${ticket.priority}`] ||
                                    ticket.priority}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    ticket.status === 1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {ticket.status === 1
                                    ? t.status_open
                                    : t.status_closed}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {ticket.department} · #{ticket.id}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setSupportView("conversation");
                              }}
                            >
                              <MessageSquare className="mr-1 h-3.5 w-3.5" />
                              {t.view_conversation}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {(ticketsData?.meta?.last_page ?? 1) > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={supportPage <= 1}
                        onClick={() => setSupportPage(supportPage - 1)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        {t.previous}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {supportPage} / {ticketsData?.meta?.last_page ?? 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          supportPage >= (ticketsData?.meta?.last_page ?? 1)
                        }
                        onClick={() => setSupportPage(supportPage + 1)}
                      >
                        {t.next}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* CREATE TICKET */}
              {supportView === "create" && (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSupportView("list")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-bold">{t.new_ticket}</h2>
                  </div>

                  <div className="max-w-lg space-y-4">
                    <div className="space-y-2">
                      <Label>{t.ticket_title}</Label>
                      <Input
                        value={createTicketForm.title}
                        onChange={(e) =>
                          setCreateTicketForm({
                            ...createTicketForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.ticket_subject}</Label>
                      <Textarea
                        value={createTicketForm.subject}
                        onChange={(e) =>
                          setCreateTicketForm({
                            ...createTicketForm,
                            subject: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.ticket_priority}</Label>
                      <Select
                        value={createTicketForm.priority}
                        onValueChange={(v: any) =>
                          setCreateTicketForm({
                            ...createTicketForm,
                            priority: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            {t.priority_low}
                          </SelectItem>
                          <SelectItem value="medium">
                            {t.priority_medium}
                          </SelectItem>
                          <SelectItem value="high">
                            {t.priority_high}
                          </SelectItem>
                          <SelectItem value="urgent">
                            {t.priority_urgent}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {createTicketMutation.isError && (
                      <p className="text-sm text-destructive">
                        {(createTicketMutation.error as any)?.response?.data
                          ?.message || t.error}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          createTicketMutation.mutate(createTicketForm, {
                            onSuccess: () => {
                              setSupportView("list");
                              setCreateTicketForm({
                                title: "",
                                subject: "",
                                priority: "medium",
                                department_id: 1,
                              });
                            },
                          });
                        }}
                        disabled={
                          createTicketMutation.isPending ||
                          !createTicketForm.title ||
                          !createTicketForm.subject
                        }
                      >
                        {createTicketMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {t.save}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSupportView("list")}
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* CONVERSATION */}
              {supportView === "conversation" && selectedTicketId && (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSupportView("list");
                        setSelectedTicketId(null);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-bold">
                      {t.support} #{selectedTicketId}
                    </h2>
                  </div>

                  <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : !ticketMessages || ticketMessages.length === 0 ? (
                      <p className="py-8 text-center text-muted-foreground">
                        {t.no_tickets}
                      </p>
                    ) : (
                      ticketMessages.map((msg: TicketMessage) => {
                        const isCustomer =
                          msg.message.role === "customer_level";
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg p-3 ${
                                isCustomer
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-xs font-medium opacity-70">
                                {msg.sender_details?.name || msg.message.from}
                              </p>
                              {msg.message.message && (
                                <p className="mt-1 text-sm">
                                  {msg.message.message}
                                </p>
                              )}
                              <p className="mt-1 text-xs opacity-50">
                                {msg.message.timestamp}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Send message */}
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder={t.type_message}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!newTicketMessage.trim() || !selectedTicketId)
                            return;
                          addTicketMessageMutation.mutate(
                            {
                              ticket_id: selectedTicketId,
                              message: newTicketMessage.trim(),
                            },
                            { onSuccess: () => setNewTicketMessage("") }
                          );
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (!newTicketMessage.trim() || !selectedTicketId)
                          return;
                        addTicketMessageMutation.mutate(
                          {
                            ticket_id: selectedTicketId,
                            message: newTicketMessage.trim(),
                          },
                          { onSuccess: () => setNewTicketMessage("") }
                        );
                      }}
                      disabled={
                        addTicketMessageMutation.isPending ||
                        !newTicketMessage.trim()
                      }
                    >
                      {addTicketMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveTicketMutation.mutate(selectedTicketId)
                      }
                      disabled={resolveTicketMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      {t.resolve_ticket}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              {/* Success Banner */}
              {walletSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{t.wallet_deposit_success || "Ödeme başarıyla tamamlandı. Bakiyeniz güncellendi."}</span>
                </div>
              )}

              {/* Balance Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    {t.wallet_balance || "Mevcut Bakiye"}
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {t.currency}{Number(walletData?.wallets?.total_balance ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {t.wallet_total_earnings || "Toplam Kazanç"}
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {t.currency}{Number(walletData?.wallets?.total_earnings ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    {t.wallet_total_withdrawn || "Toplam Çekilen"}
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    {t.currency}{Number(walletData?.wallets?.total_withdrawn ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <div className="rounded-lg border bg-card p-4 sm:p-6">
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">{t.wallet_transactions || "İşlem Geçmişi"}</h2>
                    {walletData?.wallets && (
                      <Button
                        size="sm"
                        className="shrink-0"
                        onClick={() => { setDepositError(""); setDepositAmount(""); setBankTransferPending(false); setDepositOpen(true); }}
                      >
                        <PlusCircle className="mr-1.5 h-4 w-4" />
                        {t.wallet_add_money || "Para Yükle"}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {(["", "credit", "debit"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => { setWalletTypeFilter(f); setWalletPage(1); }}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          walletTypeFilter === f
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {f === "" ? t.filter_all : f === "credit" ? t.wallet_credit : t.wallet_debit}
                      </button>
                    ))}
                  </div>
                </div>

                {walletTxLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !walletTxData?.transactions || walletTxData.transactions.length === 0 ? (
                  <div className="py-10 text-center">
                    <Wallet className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">{t.wallet_no_transactions || "Henüz işlem bulunmuyor."}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {walletTxData.transactions.map((tx: WalletTransaction) => (
                      <div key={tx.id} className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          {tx.type === "credit" ? (
                            <ArrowDownCircle className="h-8 w-8 shrink-0 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="h-8 w-8 shrink-0 text-orange-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {tx.type === "credit" ? t.wallet_credit || "Gelen" : t.wallet_debit || "Giden"}
                              {tx.purpose && (
                                <span className="ml-1 text-muted-foreground">({tx.purpose})</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString("tr-TR", {
                                  day: "2-digit", month: "2-digit", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                              <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                tx.payment_status === "paid" ? "bg-green-100 text-green-800" :
                                tx.payment_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {tx.payment_status === "paid" ? t.wallet_status_paid || "Tamamlandı" :
                                 tx.payment_status === "pending" ? t.wallet_status_pending || "Beklemede" :
                                 t.wallet_status_failed || "Başarısız"}
                              </span>
                            </div>
                            {tx.transaction_ref && (
                              <p className="text-xs text-muted-foreground">Ref: {tx.transaction_ref}</p>
                            )}
                          </div>
                        </div>
                        <p className={`text-base font-bold ${tx.type === "credit" ? "text-green-600" : "text-orange-600"}`}>
                          {tx.type === "credit" ? "+" : "-"}{t.currency}{Number(tx.amount).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {(walletTxData?.meta?.last_page ?? 1) > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4">
                    <Button variant="outline" size="sm" disabled={walletPage <= 1}
                      onClick={() => setWalletPage(walletPage - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />{t.previous}
                    </Button>
                    <span className="px-3 text-sm text-muted-foreground">
                      {walletPage} / {walletTxData?.meta?.last_page ?? 1}
                    </span>
                    <Button variant="outline" size="sm"
                      disabled={walletPage >= (walletTxData?.meta?.last_page ?? 1)}
                      onClick={() => setWalletPage(walletPage + 1)}>
                      {t.next}<ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{t.wallet_add_money || "Para Yükle"}</h3>
              <button
                onClick={() => { setDepositOpen(false); setDepositError(""); }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <Label>{t.wallet_deposit_amount || "Yüklenecek Tutar"}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {t.currency}
                </span>
                <Input
                  type="number"
                  min="1"
                  max={walletData?.max_deposit_per_transaction}
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0"
                  autoFocus
                />
              </div>
              {walletData?.max_deposit_per_transaction && (
                <p className="text-xs text-muted-foreground">
                  {t.wallet_max_deposit || "Maksimum"}: {t.currency}{walletData.max_deposit_per_transaction}
                </p>
              )}
            </div>

            {/* Payment Gateway Selection */}
            <div className="mb-4 space-y-2">
              <Label>{t.wallet_pay_with_card || "Ödeme Yöntemi"}</Label>
              {gatewaysLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.loading}
                </div>
              ) : walletGateways.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ödeme yöntemi bulunamadı.</p>
              ) : (
                <div className="grid gap-2">
                  {walletGateways.map((gw: PaymentGateway) => {
                    const IconComponent = walletGatewayIconMap[gw.slug] ?? CreditCard;
                    const isSelected = selectedWalletGateway === gw.slug;
                    return (
                      <button
                        key={gw.slug}
                        type="button"
                        onClick={() => setSelectedWalletGateway(gw.slug)}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {gw.image_url ? (
                          <Image
                            src={gw.image_url}
                            alt={gw.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <IconComponent className="h-5 w-5 shrink-0" />
                        )}
                        <span className="text-sm font-medium">{gw.name}</span>
                        {isSelected && <Check className="ml-auto h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bank account preview when bank_transfer selected */}
            {selectedWalletGateway === "bank_transfer" && !bankTransferPending && walletData?.bank_account?.iban && (
              <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
                <p className="font-semibold text-sm mb-2">Havale Bilgileri</p>
                {walletData.bank_account.bank_name && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Banka:</span>
                    <span className="font-medium">{walletData.bank_account.bank_name}</span>
                  </div>
                )}
                {walletData.bank_account.account_holder && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Hesap Sahibi:</span>
                    <span className="font-medium">{walletData.bank_account.account_holder}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">IBAN:</span>
                  <span className="font-mono font-semibold break-all text-right">{walletData.bank_account.iban}</span>
                </div>
              </div>
            )}

            {depositError && (
              <p className="mb-3 rounded-md bg-destructive/10 p-2 text-xs text-destructive">{depositError}</p>
            )}

            {bankTransferPending && (
              <div className="mb-4 space-y-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <p className="font-semibold">Havale Talebi Oluşturuldu</p>
                  <p className="text-xs mt-1">Aşağıdaki hesaba havale/EFT yapın. Admin onayından sonra bakiyenize yansır.</p>
                </div>
                {walletData?.bank_account?.iban ? (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
                    {walletData.bank_account.bank_name && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Banka:</span>
                        <span className="font-medium text-right">{walletData.bank_account.bank_name}</span>
                      </div>
                    )}
                    {walletData.bank_account.account_holder && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Hesap Sahibi:</span>
                        <span className="font-medium text-right">{walletData.bank_account.account_holder}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">IBAN:</span>
                      <span className="font-mono text-xs font-semibold text-right break-all">{walletData.bank_account.iban}</span>
                    </div>
                    {walletData.bank_account.description && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Açıklama:</span>
                        <span className="text-xs text-right">{walletData.bank_account.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2 border-t pt-2 mt-1">
                      <span className="text-muted-foreground shrink-0">Tutar:</span>
                      <span className="font-bold text-primary">{t.currency}{depositAmount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Banka bilgileri için admin ile iletişime geçin.</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!bankTransferPending ? (
                <Button
                  className="flex-1"
                  onClick={handleDeposit}
                  disabled={depositProcessing || !depositAmount || Number(depositAmount) <= 0 || !selectedWalletGateway}
                >
                  {depositProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {selectedWalletGateway === "bank_transfer"
                    ? "Talep Oluştur"
                    : (t.wallet_pay || "Ödemeye Geç")}
                </Button>
              ) : null}
              <Button
                variant="outline"
                className={bankTransferPending ? "flex-1" : ""}
                onClick={() => {
                  setDepositOpen(false);
                  setDepositError("");
                  setBankTransferPending(false);
                }}
              >
                {bankTransferPending ? "Kapat" : t.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Dialog */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">{t.cancel_confirm}</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {t.cancel_confirm_message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingOrderId(null)}
              >
                {t.cancel_no}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  cancelOrderMutation.mutate(cancellingOrderId, {
                    onSettled: () => setCancellingOrderId(null),
                  });
                }}
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                {t.cancel_yes}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold">{t.delete_account_confirm}</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {t.delete_account_message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t.delete_no}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                {t.delete_yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
