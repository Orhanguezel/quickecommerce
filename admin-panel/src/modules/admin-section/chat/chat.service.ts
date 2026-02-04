import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { useBaseService } from '@/modules/core/base.service';
import { ChatSettings, LiveChat } from './chat.type';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

export const useChatSettingsService = () => {
  return useBaseService<ChatSettings>(API_ENDPOINTS.CHAT_SETTINGS);
};

export const useLiveChatService = () => {
  return useBaseService<LiveChat>(API_ENDPOINTS.LIVE_CHAT_LIST);
};
export const useChatDetailsService = () => {
  return useBaseService<LiveChat>(API_ENDPOINTS.CHAT_DETAILS);
};

export const useReplyMessageService = () => {
  return useBaseService<LiveChat>(API_ENDPOINTS.REPLY_MESSAGE);
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

  const uploadFile = async (
    file: File,
    message: string,
    chat_id: string,
    sender_id: string,
    receiver_id: string,
    receiver_type: string,
    route: string,
  ) => {
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

    if (!allowedFileTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed types are: .jpg, .png, .jpeg, .webp, .zip, .pdf');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    formData.append('chat_id', chat_id);
    formData.append('sender_id', sender_id);
    formData.append('receiver_id', receiver_id);
    formData.append('receiver_type', receiver_type);

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
