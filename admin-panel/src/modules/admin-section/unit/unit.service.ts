import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Unit } from "./unit.type";


export const useUnitListService = () => {
    return useBaseService<Unit>(API_ENDPOINTS.ADMIN_UNIT_LIST);
};

export const useUnitSaveService = () => {
    return useBaseService<Unit>(API_ENDPOINTS.UNIT_SAVE);
};

export const useUnitUpdateService = () => {
    return useBaseService<Unit>(API_ENDPOINTS.UNIT_UPDATE);
};

export const useUnitEditService = () => {
    return useBaseService<Unit>(API_ENDPOINTS.UNIT_EDIT);
};

export const useUnitDeleteService = () => {
    return useBaseService<Unit>(API_ENDPOINTS.UNIT_DELETE);
};
