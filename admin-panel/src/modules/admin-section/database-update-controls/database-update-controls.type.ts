

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";


export interface DatabaseUpdateControls {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }