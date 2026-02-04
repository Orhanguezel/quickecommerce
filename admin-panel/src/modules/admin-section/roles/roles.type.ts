
import {
    type QueryOptions,
  } from "@/types";
import { ToastContent } from "react-toastify";
  
  
  export interface RolesQueryOptions extends QueryOptions {
    sort?: string;
    sortField?: string;
    pagination?:boolean
  }

  export interface RolesType {

    data: Roles

  }
  export interface Roles {
    [x: string]: ToastContent<unknown>;
    id: number; 
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    module: string;
    permissions: any;
  }