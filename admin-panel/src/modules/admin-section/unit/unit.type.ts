import { type QueryOptions, } from "@/types";
import { ToastContent } from "react-toastify";

export interface UnitQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface CustomError {
    response: {
        data: {
            [x: string]: ToastContent<unknown>;
            order: any;
        };
    };
}

export interface Unit {
  [x: string]: any;
  id: string;
  name: string;
}