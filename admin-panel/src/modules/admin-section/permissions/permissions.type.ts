
import {
    type QueryOptions,
  } from "@/types";
  
  
  export interface PermissionQueryOptions extends QueryOptions {
    sort?: string;
    sortField?: string;
    available_for?: string;
  }

  export interface PermissionType {

    data: Permission

  }
  export interface Permission {
    id: number; // Assuming 'id' is a number based on the example
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    module: string;
    permissions: any;
  }