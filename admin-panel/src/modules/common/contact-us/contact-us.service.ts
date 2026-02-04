import { useBaseService } from '@/modules/core/base.service';
import { ContactUs } from './contact-us.type';
import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

export const useContactUsAddService = () => {
  return useBaseService<ContactUs>(SELLER_API_ENDPOINTS.CONTACT_US);
};
