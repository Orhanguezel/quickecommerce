"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
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
} from "@/modules/checkout/checkout.service";
import type { CustomerAddress } from "@/modules/checkout/checkout.type";
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
} from "lucide-react";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY, AUTH_USER } from "@/lib/constants";

interface Props {
  translations: Record<string, string>;
}

type Tab = "profile" | "password" | "addresses";

export function AccountClient({ translations: t }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "home" as "home" | "office" | "others",
    title: "",
    email: "",
    contact_number: "",
    address: "",
    road: "",
    house: "",
    floor: "",
    postal_code: "",
  });

  // Queries
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const { data: addresses, isLoading: addressesLoading } =
    useAddressListQuery();

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const addAddressMutation = useAddAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();

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

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({
      type: "home",
      title: "",
      email: "",
      contact_number: "",
      address: "",
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
      road: addr.road || "",
      house: addr.house || "",
      floor: addr.floor || "",
      postal_code: addr.postal_code || "",
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    const payload = {
      ...addressForm,
      status: 1,
      is_default: !addresses || addresses.length === 0,
    };

    if (editingAddressId) {
      updateAddressMutation.mutate(
        { ...payload, id: editingAddressId } as any,
        { onSuccess: resetAddressForm }
      );
    } else {
      addAddressMutation.mutate(payload, { onSuccess: resetAddressForm });
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: t.profile, icon: User },
    { key: "password", label: t.change_password, icon: Lock },
    { key: "addresses", label: t.addresses, icon: MapPin },
  ];

  if (profileLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.my_account}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        <User className="mr-2 inline-block h-6 w-6" />
        {t.my_account}
      </h1>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="flex gap-1 lg:flex-col">
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
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="rounded-lg border bg-card p-6">
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
            <div className="rounded-lg border bg-card p-6">
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
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t.addresses}</h2>
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t.add_address}
                  </Button>
                )}
              </div>

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
        </div>
      </div>

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
