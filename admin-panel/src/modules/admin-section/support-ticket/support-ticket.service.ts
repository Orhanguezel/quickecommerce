import { useBaseService } from '@/modules/core/base.service';
import { SupportTicket } from './support-ticket.type';
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
// import { useMediaAddService } from "./product.service";

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { SupportTicketDelete } from './support-ticket.schema';

export const useSupportTicketService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_LIST);
};
export const useSupportTicketEditService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_EDIT);
};
export const useSupportTicketDetailsService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_DETAILS);
};
export const useSupportTicketAddService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_ADD);
};
export const useSupportTicketUpdateService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_UPDATE);
};
export const useSupportTicketResolveService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_RESOLVE);
};
export const useSupportTicketDeleteService = () => {
  return useBaseService<SupportTicket, any>(API_ENDPOINTS.SUPPORT_TICKET_REMOVE);
};

export const useSupportTicketPriorityChangeService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_PRIORITY_CHANGE);
};

export const useReplyMessageService = () => {
  return useBaseService<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_REPLY_MESSAGE);
};

export const useFileUploadService = () => {
  const locale = useLocale();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 5000000,
      headers: {
        'Content-Type': 'multipart/form-data', // Ensure multipart for file uploads
      },
    });

    instance.interceptors.request.use((config) => {
      const cookies = Cookies.get(AUTH_TOKEN_KEY);
      let token = cookies || '';

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'X-localization': locale,
      } as unknown as AxiosRequestHeaders;

      return config;
    });

    return instance;
  }, [locale]);

  const uploadFile = async (file: File, message: string, ticket_id: string, route: string) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // Validate file type
    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'application/pdf',
    ];

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'zip', 'pdf'];

    // Check MIME type OR file extension
    if (
      !allowedFileTypes.includes(file.type) &&
      !(fileExtension && allowedExtensions.includes(fileExtension))
    ) {
      throw new Error('Invalid file type. Allowed types are: .jpg, .png, .jpeg, .webp, .zip, .pdf');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message); // Append message
    formData.append('ticket_id', ticket_id); // Append ticket_id

    try {
      const response = await axiosInstance.post(route, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    uploadFile,
  };
};
