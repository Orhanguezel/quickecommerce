import {
    type ProductInput,
    type Product,
  } from "@/modules/products/products.schema";
  import { type QuestionInput } from "@/modules/questions/questions.schema";
  import { type Review } from "@/modules/review/review.schema";
  import type * as SelectPrimitive from "@radix-ui/react-select";
  import { type ReactQuillProps } from "react-quill-new";
  
  export interface RichTextEditorProps extends ReactQuillProps {
    title?: string;
    placeholder?: string;
    className?: string;
    editorClassName?: string;
    name: string;
    disabled?: boolean;
    error?: string;
  }
  
  export interface BreadcrumbItemProps {
    name: string;
    href: string;
  }
  export interface AuthResponse {
    [x: string]: ToastContent<unknown>;
    role: string;
    token: string;
    permissions: string[];
  }
  export interface FormResponse {
    success?: boolean;
    message?: string;
  }
  
  export enum Permission {
    SuperAdmin = "super_admin",
    StoreOwner = "store_owner",
    Staff = "staff",
    Customer = "customer",
  }
  
  export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    items: BreadcrumbItemProps[];
  }
  
  export interface QueryOptions {
    language: string;
    limit?: number;
    page?: number;
    orderBy?: string;
    sortedBy?: SortOrder;
    search?: string;
  }
  
  export interface PaginatorInfo<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: string[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  }
  
  export interface MappedPaginatorInfo {
    currentPage: number;
    firstPageUrl: string;
    from: number;
    lastPage: number;
    lastPageUrl: string;
    links: string[];
    nextPageUrl: string | null;
    path: string;
    perPage: number;
    prevPageUrl: string | null;
    to: number;
    total: number;
    hasMorePages: boolean;
  }
  
  export interface Attachment extends File {
    id: string;
    thumbnail: string;
    original: string; // Add the missing 'original' property
    __typename?: string;
  }
  
  export interface ApiResponse<T> {
    data: T[];
  }
  
  export interface SelectProps
    extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Select> {
    placeholder?: string;
    error?: boolean;
    isPending?: boolean;
    query?: string;
  }
  
  export interface QueryOptions {
    page?: number;
    limit?: number;
  }
  
  export interface ProductQueryOptions extends QueryOptions {
    shop_id: string;
    sortedBy: string;
    orderBy: string;
    name: string;
    categories: string;
    tags: string;
    type: string;
    manufacturer: string;
    author: string;
    price: string;
    min_price: string;
    max_price: string;
    language: string;
    searchType: string;
    searchQuery: string;
    text: string;
    slug: string;
    condition: string;
    rating: string;
  }
  
  export interface SearchParamOptions {
    type: string;
    name: string;
    categories: string;
    tags: string;
    author: string;
    price: string;
    manufacturer: string;
    status: string;
    is_active: string;
    shop_id: string;
    min_price: string;
    max_price: string;
    rating: number;
    question: string;
    notice: string;
    faq_type: string;
    issued_by: string;
    title: string;
    target: string;
    shops: string;
    visibility: string;
    condition: string;
  }
  
  export interface Attachment {
    thumbnail: string;
    original: string;
    id?: string;
  }
  export enum ProductStatus {
    Publish = "publish",
    Draft = "draft",
    UnderReview = "under_review",
    Approved = "approved",
    UnPublish = "unpublish",
    Rejected = "rejected",
  }
  
  export interface ReviewQueryOptions extends QueryOptions {
    type?: string;
    product_id?: number;
    rating?: string;
    orderBy?: string;
    sortedBy?: string;
    shop_id?: number;
  }
  
  export type Shop = {
    id: number;
    name: string;
    owner_id: number;
    slug: string;
    is_active: boolean;
  };
  
  export type ShopPaginator = PaginatorInfo<Shop>;
  
  export interface User {
    data: {
      id: string;
      name: string;
      is_active: boolean;
      email: string;
      created_at: string;
      updated_at: string;
      email_verified: boolean;
      roles: [];
      permissions: [];
    };
  }
  
  
  export interface QueryKey {
    slug: string;
    id: string;
  }
  export interface FormMessage {
    success?: boolean;
    message?: string;
  }
  
  export interface AuthFormProps {
    className?: string;
    view?: "modal" | "page";
    isRedirect?: boolean;
  }
  






  export type POPOVER_VIEWS = "CART_POPOVER";
  


  export type ReviewPaginator = PaginatorInfo<Reviews>;
  
  export type QuestionPaginator = PaginatorInfo<Question>;
  
  export interface QuestionQueryOptions extends QueryOptions {
    product_id: QuestionInput["product_id"];
  }
  
  export interface QueryOptions {
    language: string;
    page?: number;
    limit?: number;
  }
  
  export interface UpdateUserInput extends Partial<User> {
    id?: string;
  }