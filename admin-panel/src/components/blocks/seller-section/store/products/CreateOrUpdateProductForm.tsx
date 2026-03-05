'use client';
import CloudIcon from '@/assets/icons/CloudIcon';
import { AppNestedDropdown } from '@/components/blocks/common';
import { AppSearchSelect } from '@/components/blocks/common/AppSearchSelect';
import CustomSingleDatePicker from '@/components/blocks/common/CustomSingleDatePicker';
import MultiSelectTagsInput from '@/components/blocks/common/MultiSelectTagsInput';
import TiptapEditor from '@/components/blocks/common/TiptapField';
import Cancel from '@/components/blocks/custom-icons/Cancel';
import { SubmitButton } from '@/components/blocks/shared';
import PhotoUploadModal, { type UploadedImage } from '@/components/blocks/shared/PhotoUploadModal';
import multiLang from '@/components/molecules/multiLang.json';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';
import { TagsInput } from '@/components/ui/tags-input';
import GlobalImageLoader from '@/lib/imageLoader';
import { useBrandsQuery } from '@/modules/common/brand/brand.action';
import { useCategoriesQuery } from '@/modules/common/category/category.action';
import { useCurrencyQuery, useGeneralQuery } from '@/modules/common/com/com.action';
import { useUnitQuery } from '@/modules/common/unit/unit.action';
import { useProductAttributeQuery } from '@/modules/seller-section/product-attribute/product-attribute.action';
import {
  useDynamicFieldQuery,
  useProductDescriptionGenerate,
  useProductStoreMutation,
  useProductUpdateMutation,
} from '@/modules/seller-section/product/product.action';
import { ProductFormData, productSchema } from '@/modules/seller-section/product/product.schema';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/index';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Check, CloudUploadIcon, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import ProductDescriptionGenerateModal from './modal/ProductDescriptionGenerateModal';
// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  normalizeTranslationsMap,
} from '@/lib/json';
import type { LangKeys, ViewMode } from '@/lib/json';
interface Option {
  value: string;
  label: string;
}
interface SelectCategory {
  [key: string]: ReadonlyArray<Option>;
}

interface CurrencyRow {
  code: string;
  symbol?: string;
  exchange_rate: number;
  is_default?: boolean;
}

const I18N_FIELDS = [
  'name',
  'description',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'return_text',
  'delivery_time_text',
] as const;

const splitTags = (raw: any) =>
  String(raw ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const normalizeSelectGroups = (raw: any, fallbackLabelKeys: string[] = []) => {
  const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return arr
    .map((item: any) => {
      const value = item?.value ?? item?.id ?? '';
      const labelFromFallback = fallbackLabelKeys
        .map((k) => item?.[k])
        .find((v) => v !== undefined && v !== null && String(v).trim() !== '');
      const label = item?.label ?? labelFromFallback ?? value;
      return { value: String(value), label: String(label) };
    })
    .filter((x: any) => x.value && x.label);
};

const parseGeneratedJson = (raw: string): any | null => {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {}
  }
  return null;
};

const toKeywordsArray = (value: any): string[] => {
  if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean);
  if (typeof value === 'string') return splitTags(value);
  return [];
};

const InfoTooltip = ({
  text,
  side = 'top',
}: {
  text: string;
  side?: 'top' | 'right' | 'left';
}) => (
  <div className="relative group inline-flex">
    <Info className="w-4 text-custom-dark-blue dark:text-white cursor-pointer" />
    <div className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity px-3 py-2 text-sm font-medium rounded-md shadow-md pointer-events-none bg-custom-dark-blue dark:bg-white text-white dark:text-black max-w-sm w-max ${
      side === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-2'
        : side === 'left'
          ? 'right-full top-1/2 -translate-y-1/2 mr-2'
          : 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }`}>{text}</div>
  </div>
);

const CreateOrUpdateProductForm = ({ data }: any) => {
  const t = useTranslations();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const dispatch = useAppDispatch();
  const localeMain = useLocale();
  const multiLangData = useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const store_type = selectedStore?.type;
  const [viewMode, setViewMode] = useState<ViewMode>('form');

  const {
    watch,
    getValues,
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: store_type ?? '',
    },
  });
  const setValueAny = useMemo(() => makeRHFSetValueAny<ProductFormData>(setValue), [setValue]);
  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = useFormI18nScaffold<ProductFormData>({
    languages: multiLangData as any,
    excludeLangIds: ['df'],
    fields: [...I18N_FIELDS],
    control,
    getValues,
    setValueAny,
    keyOf: (field, langId) => `${field}_${langId}`,
    dfSync: {
      enabled: true,
      pairs: [
        { dfField: 'name_df', srcField: (l) => `name_${l}`, validate: true },
        { dfField: 'description_df', srcField: (l) => `description_${l}`, validate: false },
        { dfField: 'meta_title_df', srcField: (l) => `meta_title_${l}`, validate: false },
        { dfField: 'meta_description_df', srcField: (l) => `meta_description_${l}`, validate: false },
        { dfField: 'return_text_df', srcField: (l) => `return_text_${l}`, validate: false },
        {
          dfField: 'delivery_time_text_df',
          srcField: (l) => `delivery_time_text_${l}`,
          validate: false,
        },
      ],
    },
  });
  const [activeLangId, setActiveLangId] = useState<string>(() => {
    const fromLocale = uiLangs.find((l) => l.id === locale)?.id;
    return fromLocale ?? uiLangs?.[0]?.id ?? 'tr';
  });
  const handleProductJsonChange = (next: any) => {
    const safe = ensureLangKeys(safeObject(next), uiLangs as any);
    const base =
      safe?.[firstUILangId] && typeof safe[firstUILangId] === 'object'
        ? safe[firstUILangId]
        : {};
    const out: Record<string, any> = { ...safe };
    for (const lang of uiLangs) {
      const cur = safe?.[lang.id] && typeof safe[lang.id] === 'object' ? safe[lang.id] : {};
      const merged: Record<string, any> = { ...cur };
      for (const f of I18N_FIELDS) {
        if (merged[f] === undefined) merged[f] = (base as any)?.[f];
      }
      out[lang.id] = merged;
    }
    handleTranslationsJsonChange(out);
  };
  useEffect(() => {
    const exists = uiLangs.some((l) => l.id === activeLangId);
    if (!exists) setActiveLangId(uiLangs?.[0]?.id ?? 'tr');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs.map((l) => l.id).join('|')]);
  useEffect(() => {
    if (viewMode === 'json') rebuildJsonNow();
  }, [viewMode, rebuildJsonNow]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [finalSelectedID, setfinalSelectedID] = useState<number[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [spPrices, setSpPrices] = useState<Record<string, number>>({});
  const [sku, setSku] = useState<Record<string, string>>({});
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [logoData, setLogoData] = useState<Record<string, UploadedImage | null>>({});
  const [lastSelectedLogo, setLastSelectedLogo] = useState<any>(null);
  const [errorLogoMessage, setLogoErrorMessage] = useState<string>('');
  const [attributeValuesKey, setAttributeValuesKey] = useState('');
  const initializedProductIdRef = useRef<string | number | null>(null);

  const checkedValue = watch();

  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [allowChange, setAllowChange] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [priceInputCurrency, setPriceInputCurrency] = useState<string>('');
  const { categories } = useCategoriesQuery({
    pagination: false,
    type: checkedValue?.type,
  });
  const { brands } = useBrandsQuery({});
  const { units } = useUnitQuery({});

  const { productAttribute, refetch } = useProductAttributeQuery({
    type: checkedValue?.type,
  });
  let originalData = (categories as any)?.data || [];
  const brandData = useMemo(
    () => normalizeSelectGroups(brands, ['brand_name', 'name']),
    [brands],
  );
  const unitData = useMemo(() => normalizeSelectGroups(units, ['name']), [units]);
  const attributeOptions = useMemo(() => {
    return (productAttribute as any) || [];
  }, [productAttribute]);

  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const { currency } = useCurrencyQuery({});
  const currencyRows = useMemo<CurrencyRow[]>(() => {
    const raw = Array.isArray(currency) ? currency : Array.isArray((currency as any)?.data) ? (currency as any).data : [];
    return raw
      .map((c: any) => ({
        code: String(c?.code ?? c?.value ?? '').toUpperCase(),
        symbol: c?.symbol ?? '',
        exchange_rate: Number(c?.exchange_rate ?? 1),
        is_default: Boolean(c?.is_default),
      }))
      .filter((c: CurrencyRow) => c.code && Number.isFinite(c.exchange_rate) && c.exchange_rate > 0);
  }, [currency]);
  const defaultCurrency = useMemo(
    () => currencyRows.find((c) => c.is_default) ?? currencyRows[0],
    [currencyRows],
  );
  const selectedPriceCurrency = useMemo(
    () => currencyRows.find((c) => c.code === priceInputCurrency) ?? defaultCurrency,
    [currencyRows, defaultCurrency, priceInputCurrency],
  );
  useEffect(() => {
    if (!priceInputCurrency && defaultCurrency?.code) {
      setPriceInputCurrency(defaultCurrency.code);
    }
  }, [defaultCurrency, priceInputCurrency]);
  const toDefaultCurrency = (amountInSelected: number) => {
    if (!selectedPriceCurrency || !defaultCurrency) return amountInSelected;
    return amountInSelected * (defaultCurrency.exchange_rate / selectedPriceCurrency.exchange_rate);
  };
  const fromDefaultCurrency = (amountInDefault: number) => {
    if (!selectedPriceCurrency || !defaultCurrency) return amountInDefault;
    return amountInDefault * (selectedPriceCurrency.exchange_rate / defaultCurrency.exchange_rate);
  };
  const formatEditableAmount = (amountInDefault: any) => {
    if (amountInDefault === '' || amountInDefault === null || amountInDefault === undefined) return '';
    const n = Number(amountInDefault);
    if (!Number.isFinite(n)) return '';
    const converted = fromDefaultCurrency(n);
    return Number.isFinite(converted) ? Number(converted.toFixed(6)) : '';
  };
  const currencySelectOptions = useMemo(
    () =>
      currencyRows.map((c) => ({
        value: c.code,
        label: `${c.code}${c.symbol ? ` (${c.symbol})` : ''}`,
      })),
    [currencyRows],
  );
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, refetch]);

  useEffect(() => {
    if (data && attributeOptions.length > 0) {
      const newOptions: SelectCategory = {};
      const attribute = attributeOptions.find(
        (attr: { label: string }) => attr.label === attributeValuesKey,
      );
      if (attribute) {
        newOptions[attributeValuesKey] = attribute.attribute_values;
      }

      setOptions(newOptions);
    }
  }, [data, attributeOptions, attributeValuesKey]);

  const populateStatesFromApi = (apiData: any[]) => {
    if (!apiData || apiData.length === 0) return;

    const newSelectedAttributes: Option[] = [];
    const newSelectedValues: Record<string, Option[]> = {};
    let firstAttributeKey = '';
    let firstVariantCurrencyCode = '';

    apiData.forEach((variant, index) => {
      const parsedAttributes =
        variant.attributes && typeof variant.attributes === 'string'
          ? JSON.parse(variant.attributes)
          : {};

      Object.keys(parsedAttributes).forEach((key) => {
        if (!newSelectedAttributes.some((attr) => attr.value === key)) {
          newSelectedAttributes.push({
            value: key,
            label: key,
          });
          if (!firstAttributeKey) firstAttributeKey = key;
        }
      });

      Object.entries(parsedAttributes).forEach(([key, value]) => {
        if (!newSelectedValues[key]) {
          newSelectedValues[key] = [];
        }
        if (Array.isArray(value)) {
          value.forEach((val: string) => {
            if (!newSelectedValues[key].some((item) => item.value === val)) {
              newSelectedValues[key].push({
                value: val,
                label: val,
              });
            }
          });
        } else {
          if (!newSelectedValues[key].some((item) => item.value === value)) {
            newSelectedValues[key].push({
              value: value as any,
              label: value as any,
            });
          }
        }
      });

      const initialLogoData: Record<string, { image_id: string; img_url: string } | null> = {};
      setPrices((prevPrices) => ({
        ...prevPrices,
        [index]: Number(variant.price),
      }));
      setSpPrices((prevSpPrices) => ({
        ...prevSpPrices,
        [index]: Number(variant.special_price),
      }));
      setStocks((prevStocks) => ({
        ...prevStocks,
        [index]: Number(variant.stock_quantity),
      }));
      setSku((prevSku) => ({
        ...prevSku,
        [index]: variant.sku,
      }));
      if (variant.image && variant.image_url) {
        initialLogoData[index] = {
          image_id: variant.image,
          img_url: variant.image_url,
        };
      }
      if (!firstVariantCurrencyCode && variant?.price_input_currency_code) {
        firstVariantCurrencyCode = String(variant.price_input_currency_code).toUpperCase();
      }
      const firstObject = Object.values(initialLogoData)[0];
      setLogoData((prev) => ({ ...prev, [index]: firstObject }));
    });

    setSelectedAttributes(newSelectedAttributes);
    setSelectedValues(newSelectedValues);
    if (firstAttributeKey) setAttributeValuesKey(firstAttributeKey);
    if (firstVariantCurrencyCode) setPriceInputCurrency(firstVariantCurrencyCode);
  };

  useEffect(() => {
    const currentProductId = data?.id ?? null;
    if (initializedProductIdRef.current === currentProductId) return;
    initializedProductIdRef.current = currentProductId;

    if (!data) {
      rebuildJsonNow();
      return;
    }
    populateStatesFromApi(data?.variants);
    const categoryData = data?.category;
    setValue('name_df', data?.name ?? data?.label ?? '');
    setValue('description_df', data?.description ?? '');
    setValue('meta_title_df', data?.meta_title ?? '');
    const tagsArray = splitTags(data?.meta_keywords);
    setValue('meta_keywords_df', tagsArray ?? []);
    setValue('meta_description_df', data?.meta_description ?? '');
    setValue('return_text_df', data?.return_text ?? '');
    setValue('delivery_time_text_df', data?.delivery_time_text ?? '');
    setValue('brand_id', String(data?.brand?.id) ?? '');
    setValue('type', data?.type);
    setValue('unit_id', String(data?.unit?.id) ?? '');
    if (categoryData) {
      setfinalSelectedID(categoryData?.id);
      const pathName = categoryData?.category_name_paths;
      const pathNameArray = pathName === null ? [] : pathName?.split('/');
      setSelectedItems(pathNameArray);
      const pathIds = categoryData?.parent_path;
      const pathIDsArray = pathIds === null ? [] : pathIds?.split('/');
      setSelectedIDs(pathIDsArray);
    }
    const rootByField: Record<string, any> = {
      name: data?.name ?? data?.label ?? '',
      description: data?.description ?? '',
      meta_title: data?.meta_title ?? '',
      meta_description: data?.meta_description ?? '',
      return_text: data?.return_text ?? '',
      delivery_time_text: data?.delivery_time_text ?? '',
      meta_keywords: splitTags(data?.meta_keywords),
    };
    for (const f of I18N_FIELDS) {
      const v = f === 'meta_keywords' ? rootByField[f] ?? [] : rootByField[f] ?? '';
      setValue(`${f}_${firstUILangId}` as keyof ProductFormData, v as any);
    }
    const trMap = normalizeTranslationsMap(data?.translations, I18N_FIELDS);
    Object.keys(trMap).forEach((language) => {
      const translation = trMap[language] ?? {};
      setValue(`name_${language}` as keyof ProductFormData, translation?.name ?? '');
      setValue(`description_${language}` as keyof ProductFormData, translation?.description ?? '');
      setValue(`meta_title_${language}` as keyof ProductFormData, translation?.meta_title ?? '');
      setValue(
        `meta_description_${language}` as keyof ProductFormData,
        translation?.meta_description ?? '',
      );
      setValue(`return_text_${language}` as keyof ProductFormData, translation?.return_text ?? '');
      setValue(
        `delivery_time_text_${language}` as keyof ProductFormData,
        translation?.delivery_time_text ?? '',
      );
      const tagsArray = splitTags(translation?.meta_keywords);
      setValue(`meta_keywords_${language}` as keyof ProductFormData, tagsArray ?? []);
    });
    if (data?.image !== 0 && data?.image !== null) {
      setLastSelectedLogo({
        image_id: data?.image ? data?.image : '',
        img_url: data?.image_url ? data?.image_url : '/images/no-image.png',
        name: 'image',
      });
    }

    const cashOnDelivery = data?.cash_on_delivery == 1 ? true : false;
    const allowChangeInMind = data?.allow_change_in_mind == 1 ? true : false;
    const freeShippingEnabled = data?.free_shipping == 1 ? true : false;
    setCashOnDelivery(cashOnDelivery);
    setAllowChange(allowChangeInMind);
    setFreeShipping(freeShippingEnabled);
    rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const handleSaveLogo = (images: UploadedImage[]) => {
    setLastSelectedLogo(images[0]);
    const dimensions = images[0].dimensions ?? '';
    const [width, height] = dimensions.split(' x ').map((dim) => parseInt(dim.trim(), 10));
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 1 / 1) < 0.01) {
      setLogoErrorMessage('');
      return true;
    } else {
      setLogoErrorMessage('Image must have a 1:1 aspect ratio.');
      return false;
    }
  };

  const removeLogo = () => {
    setLastSelectedLogo(null);
    setLogoErrorMessage('');
  };

  const handleSelectItem = (value: string, inputType: string) => {
    setValue(inputType as any, value);
    if (inputType == 'type') {
      setShouldRefetch(true);
    }
    if (value == 'none') {
      setValue(inputType as any, '');
    }
  };
  const [combinations, setCombinations] = useState<string[][]>([]);

  const { mutate: productStore, isPending } = useProductStoreMutation();
  const { mutate: productUpdate, isPending: isUpdating } = useProductUpdateMutation();

  const buildSpecificationsPayload = () => {
    return (
      DynamicValues?.length > 0 &&
      DynamicValues.map((field: any) => {
        const selectedValue = specificationsState[field.slug] ?? '';

        const matchedValue = field.values?.find((v: any) => v.value === selectedValue);

        return {
          dynamic_field_id: field.id,
          dynamic_field_value_id: matchedValue ? matchedValue.id : null,
          name: field.name,
          type: field.type,
          custom_value: Array.isArray(selectedValue)
            ? selectedValue.join(',')
            : selectedValue || '',
        };
      })
    );
  };

  const onSubmit = async (values: ProductFormData) => {
    const defaultData: any = {
      ...values,
      id: data ? data?.id : '',
      store_id: store_id,
      category_id: finalSelectedID,
      name: values.name_df,
      description: values.description_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
      meta_keywords: values.meta_keywords_df,
      cash_on_delivery: cashOnDelivery ? 1 : 0,
      allow_change_in_mind: allowChange ? 1 : 0,
      free_shipping: freeShipping ? 1 : 0,
    };

    const translations = uiLangs
      .filter((lang) => lang.id !== firstUILangId)
      .filter((lang) => (values as any)[`name_${lang.id}`])
      .map((lang) => ({
        language_code: lang.id,
        name: (values as any)[`name_${lang.id}`],
        description: (values as any)[`description_${lang.id}`],
        meta_title: (values as any)[`meta_title_${lang.id}`],
        meta_description: (values as any)[`meta_description_${lang.id}`],
        meta_keywords: ((values as any)[`meta_keywords_${lang.id}`] || []).join(', '),
      }));
    const translations_json = ensureLangKeys(safeObject(translationsJson), uiLangs as any);

    let hasError = false;
    const combinationData = combinations.map((combo, index) => {
      const attributes = selectedAttributes.reduce((acc, attribute) => {
        const value =
          selectedValues[attribute.value]?.find((option) => combo.includes(option.label))?.label ||
          null;
        //@ts-ignore
        if (value) acc[attribute.label] = value;
        return acc;
      }, {});

      const matchingEditData = data?.variants.find((item: { attributes: string }) => {
        if (!item.attributes || typeof item.attributes !== 'string') {
          return false;
        }

        const parsedAttributes = JSON.parse(item.attributes);

        return Object.keys(attributes).every(
          //@ts-ignore
          (key) => parsedAttributes[key] === attributes[key],
        );
      });

      const price = Number(prices[index] ?? 0);
      const specialPrice = Number(spPrices[index] ?? 0);
      const Stock = Number(stocks[index] ?? 0);

      if (Object.keys(attributes).length <= 0) {
        toast.error(`Minimum one variant must be required`);
        hasError = true;
        return null;
      }

      if (Stock <= 0) {
        toast.error(`Stock quantity is required for each variant.`);
        hasError = true;
        return null;
      }

      if (specialPrice > price) {
        toast.error(
          `Special price (${specialPrice}) cannot be greater than price (${price}) at index ${
            index + 1
          }`,
        );
        hasError = true;
        return null;
      }

      return {
        id: matchingEditData?.id || null,
        variant: combo,
        price: prices[index] || 0,
        price_input_currency_code: selectedPriceCurrency?.code || defaultCurrency?.code || null,
        price_input_amount: Number(fromDefaultCurrency(Number(prices[index] || 0)).toFixed(6)),
        special_price: spPrices[index] || 0,
        special_price_input_currency_code: selectedPriceCurrency?.code || defaultCurrency?.code || null,
        special_price_input_amount: Number(
          fromDefaultCurrency(Number(spPrices[index] || 0)).toFixed(6),
        ),
        sku: sku[index] || 0,
        stock_quantity: stocks[index] || 0,
        image_url: logoData[index]?.img_url || null,
        image: logoData[index]?.image_id || null,
        attributes,
      };
    });
    if (hasError) {
      return;
    }

    if (combinationData.length <= 0) {
      return toast.error('Minimum one variant must be required');
    }
    const specifications = DynamicValues?.length > 0 ? buildSpecificationsPayload() : [];
    const submissionData = {
      ...defaultData,
      image: lastSelectedLogo ? lastSelectedLogo?.image_id : null,
      translations,
      translations_json,
      variants: combinationData,
      specifications: specifications,
    };
    return data
      ? productUpdate(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          },
        )
      : productStore(
          { ...(submissionData as any) },
          {
            onSuccess: () => {
              dispatch(setRefetch(true));
              reset();
            },
          },
        );
  };

  const [selectedAttributes, setSelectedAttributes] = useState<Option[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, Option[]>>({});

  const [options, setOptions] = useState<SelectCategory>({});

  const onChangeMultiSelect = (value: Option[]) => {
    setSelectedAttributes(value);
    const selectedKeys = value.map((attr) => attr.value);
    if (selectedKeys.length === 0) {
      setCombinations([]);
      setSelectedValues({});
      return;
    }
    const newOptions: { [key: string]: Option[] } = {};
    const newSelectedValues: { [key: string]: Option | null } = {};
    selectedKeys?.forEach((key) => {
      const attribute = attributeOptions.find((attr: { value: string }) => attr.value === key);
      if (attribute) {
        newOptions[key] = attribute?.attribute_values;
        if (!selectedValues[key]) {
          newSelectedValues[key] = null;
        }
      }
    });
    setOptions(newOptions);
    //@ts-ignore
    setSelectedValues((prev) => ({ ...prev, ...newSelectedValues }));
  };

  const handleChange = (
    newValue: MultiValue<Option>,
    actionMeta: ActionMeta<Option>,
    attribute: string,
  ) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attribute]: newValue as Option[],
    }));
  };
  const handleCreate = (inputValue: string, attributeKey: number) => {
    const newOption = { value: Date.now(), label: inputValue };
    setOptions((prev) => ({
      ...prev,
      [attributeKey]: [...(prev[attributeKey] || []), newOption],
    }));
    setSelectedValues((prev) => ({
      ...prev,
      [attributeKey]: [...(prev[attributeKey] || []), newOption],
    }));
  };

  useEffect(() => {
    const attributeValues = selectedAttributes.map(
      (attribute) => selectedValues[attribute.value]?.map((option) => option.label) || [''],
    );
    const generateCombinations = (arrays: string[][]): string[][] => {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const combinations = generateCombinations(rest);
      return first.flatMap((value) => combinations.map((combination) => [value, ...combination]));
    };

    const allCombinations = generateCombinations(attributeValues).map((combination) =>
      combination.join('-').replace(/^-|-$/, ''),
    );
    setCombinations(allCombinations as any);
  }, [selectedAttributes, selectedValues]);

  const isDarkMode = () =>
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const customStyles = {
    option: (provided: any, state: any) => {
      const dark = isDarkMode();

      return {
        ...provided,
        backgroundColor: state.isSelected
          ? dark
            ? '#334155'
            : '#e5e7eb'
          : state.isFocused
            ? dark
              ? '#1e293b'
              : '#f3f4f6'
            : 'transparent',
        color: dark ? '#f1f5f9' : '#000',
        padding: '10px',
        cursor: 'pointer',
      };
    },
    singleValue: (provided: any) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      color: isDarkMode() ? '#f1f5f9' : '#000',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkMode() ? '#000' : '#fff',
      zIndex: 50,
    }),
  };
  const triggerLogo = (
    <div className="hover:cursor-pointer">
      {lastSelectedLogo?.img_url ? (
        <div className="relative w-32 h-32 group">
          <Image
            loader={GlobalImageLoader}
            src={lastSelectedLogo?.img_url}
            alt={(lastSelectedLogo?.name as string) ?? 'product_image'}
            fill
            sizes="128px"
            className="w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] h-20 border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-2 text-blue-500 text-xs font-medium">{t('common.drag_and_drop')}</p>
          </div>
        </div>
      )}
    </div>
  );
  const handleVariantsImage = (key: any) => (images: UploadedImage[]) => {
    const selectedImage = images[0];
    setLogoData((prev) => ({ ...prev, [key]: selectedImage }));
    return true;
  };
  const isSelectedValuesEmpty = Object.values(selectedValues).every(
    (value) => Array.isArray(value) && value.length === 0,
  );

  const { DynamicFieldList } = useDynamicFieldQuery({
    store_type: store_type,
  });
  const DynamicValues = (DynamicFieldList as any)?.data ?? {};
  const [specificationsState, setSpecificationsState] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const specificationsEditData = data?.specifications;
    if (DynamicValues?.length > 0) {
      const initialSpec: { [key: string]: any } = {};
      let hasChanges = false;

      DynamicValues.forEach((field: any) => {
        const existingSpec = specificationsEditData?.find(
          (spec: any) => spec?.dynamicField?.slug === field.slug,
        );
        const currentValue = specificationsState[field.slug];
        let newValue;

        if (field.type === 'select') {
          const option = field.values?.find(
            (opt: any) =>
              opt.value === existingSpec?.value ||
              opt.label === existingSpec?.value ||
              String(opt.value) === String(existingSpec?.value),
          );
          newValue = option?.value ?? '';
        } else if (field.type === 'multiselect') {
          if (typeof existingSpec?.value === 'string') {
            newValue = existingSpec.value.split(',').map((v: string) => v.trim());
          } else if (Array.isArray(existingSpec?.custom_value)) {
            newValue = existingSpec.custom_value;
          } else {
            newValue = [];
          }
        } else if (field.type === 'checkbox') {
          if (typeof existingSpec?.value === 'string') {
            newValue = existingSpec.value.split(',').map((v: string) => v.trim());
          } else if (Array.isArray(existingSpec?.custom_value)) {
            newValue = existingSpec.custom_value;
          } else {
            newValue = [];
          }
        } else {
          newValue = existingSpec?.value ?? '';
        }

        if (currentValue !== newValue) {
          hasChanges = true;
        }
        initialSpec[field.slug] = newValue;
      });

      if (hasChanges) {
        setSpecificationsState(initialSpec);
      }
    }
  }, [DynamicValues, data]);

  const handleSpecificationChange = (slug: string, value: string) => {
    setSpecificationsState((prev) => ({
      ...prev,
      [slug]: value,
    }));
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutate: GenerateDescription } = useProductDescriptionGenerate();
  const handleGenerateDescription = (prompt: string, langId: string) => {
    const langIds = uiLangs.map((l) => l.id).join(', ');
    const aiPrompt = `${prompt}

Return ONLY valid JSON. Do not add markdown.
Output schema must be:
{
  "${uiLangs?.[0]?.id ?? 'tr'}": {
    "name": "",
    "description": "",
    "meta_title": "",
    "meta_description": "",
    "meta_keywords": [],
    "return_text": "",
    "delivery_time_text": ""
  }
}
Rules:
- Include these language keys: ${langIds}
- Improve ${langId} content quality and generate/complete all fields.
- Translate/adapt all fields for the other languages.
- meta_keywords must be an array of strings.`;
    const payload = { prompt: aiPrompt };
    setLoading(true);

    GenerateDescription(payload as any, {
      onSuccess: (res: any) => {
        const generatedText = res?.data?.generated_content ?? '';
        const parsed = parseGeneratedJson(generatedText);
        const parsedRoot =
          parsed && typeof parsed === 'object'
            ? (parsed?.translations && typeof parsed.translations === 'object'
                ? parsed.translations
                : parsed)
            : null;

        let hasApplied = false;
        if (parsedRoot && typeof parsedRoot === 'object') {
          for (const lang of uiLangs) {
            const block = (parsedRoot as any)?.[lang.id];
            if (!block || typeof block !== 'object') continue;
            hasApplied = true;
            setValue(`name_${lang.id}` as keyof ProductFormData, String(block?.name ?? ''));
            setValue(
              `description_${lang.id}` as keyof ProductFormData,
              String(block?.description ?? ''),
            );
            setValue(
              `meta_title_${lang.id}` as keyof ProductFormData,
              String(block?.meta_title ?? ''),
            );
            setValue(
              `meta_description_${lang.id}` as keyof ProductFormData,
              String(block?.meta_description ?? ''),
            );
            setValue(
              `meta_keywords_${lang.id}` as keyof ProductFormData,
              toKeywordsArray(block?.meta_keywords),
            );
            setValue(
              `return_text_${lang.id}` as keyof ProductFormData,
              String(block?.return_text ?? ''),
            );
            setValue(
              `delivery_time_text_${lang.id}` as keyof ProductFormData,
              String(block?.delivery_time_text ?? ''),
            );
          }
        }

        if (!hasApplied) {
          setValue(`description_${langId}` as keyof ProductFormData, generatedText);
        }
        rebuildJsonNow();
        setLoading(false);
        setIsModalOpen(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('name_df' as any)} />
        <input type="hidden" {...register('description_df' as any)} />
        <input type="hidden" {...register('meta_title_df' as any)} />
        <input type="hidden" {...register('meta_description_df' as any)} />
        <input type="hidden" {...register('meta_keywords_df' as any)} />
        <input type="hidden" {...register('return_text_df' as any)} />
        <input type="hidden" {...register('delivery_time_text_df' as any)} />

        <Card className="mt-2">
          <CardContent className="p-2 md:p-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {data ? t('button.update_product') : t('button.add_product')}
            </div>
            <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                className={[
                  'px-4 py-2 text-sm font-medium transition',
                  viewMode === 'json'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                JSON
              </button>
            </div>
          </CardContent>
        </Card>

        {viewMode === 'json' ? (
          <Card className="mt-4">
            <CardContent className="p-2 md:p-6">
              <AdminI18nJsonPanel
                label="Product JSON"
                languages={uiLangs as any}
                value={translationsJson}
                onChange={handleProductJsonChange}
                perLanguage={true}
                showAllTab={true}
              />
            </CardContent>
          </Card>
        ) : (
      <Tabs value={activeLangId} onValueChange={(v) => setActiveLangId(String(v))} className="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <Card className="">
                <CardContent className="p-2 md:p-4">
                  <p className="text-lg md:text-2xl font-medium mb-4">
                    {t('label.basic_information')}
                  </p>
                  <div className="">
                    <TabsList dir={dir} className="flex justify-start bg-white dark:bg-[#1f2937]">
                      {uiLangs.map((lang) => (
                        <TabsTrigger key={lang.id} value={lang.id}>
                          {lang.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div dir={dir} className="grid grid-cols-1 gap-4">
                      <div>
                        {uiLangs.map((lang) => {
                          return (
                            <TabsContent key={lang.id} value={lang.id}>
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>{t('label.category')} </span>
                                </p>
                                <AppNestedDropdown
                                  selectedItems={selectedItems}
                                  selectedIDs={selectedIDs}
                                  finalSelectedID={finalSelectedID}
                                  setfinalSelectedID={setfinalSelectedID}
                                  setSelectedItems={setSelectedItems}
                                  setSelectedIDs={setSelectedIDs}
                                  groups={originalData}
                                />
                              </div>
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>
                                    {' '}
                                    {t('label.product_name')} (
                                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  </span>
                                </p>
                                <Input
                                  id={`name_${lang.id}`}
                                  {...register(`name_${lang.id}` as keyof ProductFormData)}
                                  className="app-input"
                                  placeholder={t('place_holder.enter_value')}
                                />
                                {errors[`name_${lang.id}` as keyof ProductFormData] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {(errors as any)[`name_${lang.id}`]?.message}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 items-center mb-4">
                                <ProductDescriptionGenerateModal
                                  trigger={
                                    <Button
                                      variant="outline"
                                      className="app-button"
                                      disabled={GeneralData?.com_openai_enable_disable !== 'on' && GeneralData?.com_claude_enable_disable !== 'on'}
                                    >
                                      <span className="mx-1">{t('label.generate_description_with_ai')}</span>
                                    </Button>
                                  }
                                  onSave={(prompt: string) =>
                                    handleGenerateDescription(prompt, lang.id)
                                  }
                                  loading={loading}
                                  //@ts-ignore
                                  name={watch(`name_${lang.id}`)}
                                  lang={t(`lang.${lang.id}`)}
                                  allLangs={uiLangs.map((l) => t(`lang.${l.id}` as `lang.${LangKeys}`))}
                                  categories={selectedItems}
                                  setIsModalOpen={setIsModalOpen}
                                  isModalOpen={isModalOpen}
                                />
                                {GeneralData?.com_openai_enable_disable !== 'on' && GeneralData?.com_claude_enable_disable !== 'on' && (
                                  <InfoTooltip text={t('label.ai_generate_settings_off')} />
                                )}
                              </div>
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>
                                    {t('label.product_description')} (
                                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  </span>
                                </p>
                                <Controller
                                  control={control}
                                  name={`description_${lang.id}` as keyof ProductFormData}
                                  render={({ field }) => (
                                    <TiptapEditor
                                      //@ts-ignore
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                    />
                                  )}
                                />
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  <span>{t('label.video_url')}</span>
                                </p>
                                <div className="my-2">
                                  <Input
                                    type="text"
                                    defaultValue={data?.video_url ? String(data?.video_url) : ''}
                                    id="video_url"
                                    {...register('video_url' as keyof ProductFormData)}
                                    className="app-input"
                                    placeholder={t('place_holder.youtube_embed_code')}
                                  />
                                  {errors[`video_url` as keyof ProductFormData] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {errors[`video_url`]?.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>
                                    {t('label.meta_title')} (
                                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  </span>
                                </p>
                                <Input
                                  id={`meta_title_${lang.id}`}
                                  {...register(`meta_title_${lang.id}` as keyof ProductFormData)}
                                  className="app-input"
                                  placeholder={t('place_holder.enter_value')}
                                />
                              </div>
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>
                                    {t('label.meta_keywords')} (
                                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  </span>
                                  <InfoTooltip text={t('tooltip.enter_meta_key')} />
                                </div>
                                <Controller
                                  name={`meta_keywords_${lang.id}` as keyof ProductFormData}
                                  control={control}
                                  render={({ field }) => (
                                    <TagsInput
                                      {...field}
                                      value={Array.isArray(field.value) ? field.value : []}
                                      onChange={(newValue: string[]) => field.onChange(newValue)}
                                      placeholder={`${t('place_holder.enter_meta_key')} ${t(
                                        `lang.${lang.id}` as `lang.${LangKeys}`,
                                      )}`}
                                      className="app-input"
                                    />
                                  )}
                                />
                              </div>
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                  <span>
                                    {t('label.meta_description')} (
                                    {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  </span>
                                </p>
                                <Textarea
                                  id={`meta_description_${lang.id}`}
                                  {...register(
                                    `meta_description_${lang.id}` as keyof ProductFormData,
                                  )}
                                  className="app-input"
                                  placeholder={t('place_holder.enter_value')}
                                />
                              </div>
                            </TabsContent>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1 space-y-4">
              {checkedValue?.type && (
                <Card>
                  <CardContent className="p-4">
                    <div className="">
                      <div className="">
                        <p className="text-sm font-medium mb-1">{t('label.type')}</p>
                        <p className="bg-gray-50 dark:bg-gray-900 w-full rounded-md px-2 p-1.5 border border-slate-300 dark:border-[#475569] capitalize">
                          {checkedValue?.type}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1"> {t('label.unit')}</p>
                      <Controller
                        control={control}
                        name="unit_id"
                        defaultValue={data && data?.unit?.id ? String(data?.unit?.id) : ''}
                        render={({ field }) => (
                          <>
                            <AppSearchSelect
                              value={String(field.value ?? '')}
                              onSelect={(value) => {
                                field.onChange(value);
                                handleSelectItem(value, 'unit_id');
                              }}
                              groups={unitData}
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{t('label.brand')}</p>
                      <Controller
                        control={control}
                        name="brand_id"
                        defaultValue={data && data?.brand?.id ? String(data?.brand?.id) : ''}
                        render={({ field }) => (
                          <AppSearchSelect
                            value={String(field.value ?? '')}
                            onSelect={(value) => {
                              field.onChange(value);
                              handleSelectItem(value, 'brand_id');
                            }}
                            groups={brandData}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/*  <Card className="">
              <CardContent className="p-4">
                <div className="">
                  {[
                    "makeup",
                    "clothing",
                    "furniture",
                    "gadgets",
                    "bag",
                  ].includes(checkedValue?.type ?? "") ? (
                    <div className="">
                      <p className="text-sm font-medium mb-2">
                        {t("label.warenty")}{" "}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t("label.warenty_text")}
                        </p>
                        <Input
                          id={`warranty_text`}
                          {...register(
                            `warranty_text` as keyof ProductFormData
                          )}
                          className="app-input"
                          placeholder={t("place_holder.enter_value")}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.warenty_period")}
                        </p>
                        <Input
                          type="number"
                          id={`warranty_period`}
                          {...register(
                            `warranty_period` as keyof ProductFormData
                          )}
                          className="app-input"
                          placeholder={t("place_holder.enter_value")}
                        />
                      </div>
                    </div>
                  ) : ["medicine"].includes(checkedValue?.type ?? "") ? (
                    <div className="">
                      <p className="text-sm font-medium mb-2">
                        {t("label.availability")}{" "}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">
                          {t("label.manufacture_date")}
                        </p>
                        <Controller
                          name="manufacture_date"
                          control={control}
                          render={({ field }) => (
                            <CustomSingleDatePicker
                              label=""
                              selectedDate={
                                field.value
                                  ? parse(field.value, "yyyy-MM-dd", new Date())
                                  : null
                              }
                              onChange={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                } else {
                                  field.onChange("");
                                }
                              }}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {t("label.expire_date")}
                        </p>
                        <Controller
                          name="expiry_date"
                          control={control}
                          render={({ field }) => {
                            const startDateValue = watch("manufacture_date");
                            const parsedStartDate = startDateValue
                              ? startOfDay(
                                  parse(
                                    startDateValue,
                                    "yyyy-MM-dd",
                                    new Date()
                                  )
                                )
                              : null;

                            const today = startOfDay(new Date());

                            let minDate = today;
                            if (parsedStartDate && parsedStartDate > today) {
                              minDate = parsedStartDate;
                            }
                            return (
                              <CustomSingleDatePicker
                                label=""
                                selectedDate={
                                  field.value
                                    ? parse(
                                        field.value,
                                        "yyyy-MM-dd",
                                        new Date()
                                      )
                                    : null
                                }
                                onChange={(date) => {
                                  if (date) {
                                    field.onChange(format(date, "yyyy-MM-dd"));
                                  } else {
                                    field.onChange("");
                                  }
                                }}
                                minDate={minDate}
                              />
                            );
                          }}
                        />
                        {errors.expiry_date && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.expiry_date.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="">
                      <p className="text-sm font-medium mb-2">
                        {t("label.availability")}{" "}
                      </p>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <div className="w-full mb-4">
                          <p className="text-sm font-medium mb-1">
                            {t("label.start_time")}
                          </p>
                          <div className="grid grid-cols-3 items-center gap-2">
                            <div className="col-span-2">
                              <Controller
                                name="start_date"
                                control={control}
                                render={({ field }) => (
                                  <CustomSingleDatePicker
                                    label=""
                                    selectedDate={
                                      field.value
                                        ? parse(
                                            field.value,
                                            "yyyy-MM-dd",
                                            new Date()
                                          )
                                        : null
                                    }
                                    onChange={(date) => {
                                      if (date) {
                                        field.onChange(
                                          format(date, "yyyy-MM-dd")
                                        );
                                      } else {
                                        field.onChange("");
                                      }
                                    }}
                                  />
                                )}
                              />
                            </div>
                            <Input
                              type="time"
                              id="start_time"
                              {...register("start_time")}
                              className="app-input flex flex-col "
                            />
                          </div>
                        </div>
                        <div className="w-full mb-4">
                          <p className="text-sm font-medium mb-1">
                            {t("label.end_time")}
                          </p>
                          <div className="grid grid-cols-3  items-center gap-2">
                            <div className="col-span-2">
                              <Controller
                                name="end_date"
                                control={control}
                                render={({ field }) => {
                                  const startDateValue = watch("start_date");
                                  const parsedStartDate = startDateValue
                                    ? startOfDay(
                                        parse(
                                          startDateValue,
                                          "yyyy-MM-dd",
                                          new Date()
                                        )
                                      )
                                    : null;

                                  const today = startOfDay(new Date());

                                  let minDate = today;
                                  if (
                                    parsedStartDate &&
                                    parsedStartDate > today
                                  ) {
                                    minDate = parsedStartDate;
                                  }
                                  return (
                                    <CustomSingleDatePicker
                                      label=""
                                      selectedDate={
                                        field.value
                                          ? parse(
                                              field.value,
                                              "yyyy-MM-dd",
                                              new Date()
                                            )
                                          : null
                                      }
                                      onChange={(date) => {
                                        if (date) {
                                          field.onChange(
                                            format(date, "yyyy-MM-dd")
                                          );
                                        } else {
                                          field.onChange("");
                                        }
                                      }}
                                      minDate={minDate}
                                    />
                                  );
                                }}
                              />
                            </div>
                            <Input
                              type="time"
                              id="end_time"
                              {...register("end_time")}
                              className="app-input flex flex-col"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}

              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span>{t('label.thumbnail')}</span>
                      <InfoTooltip text={t('tooltip.aspect_ratio_1_1')} />
                    </div>
                    <div className="relative flex align-start gap-4 my-2">
                      <div className="relative w-32">
                        <PhotoUploadModal
                          trigger={triggerLogo}
                          isMultiple={false}
                          onSave={handleSaveLogo}
                          usageType="product"
                        />
                        {lastSelectedLogo?.image_id && (
                          <Cancel
                            customClass="absolute top-0 right-0 m-1"
                            onClick={(event: { stopPropagation: () => void }) => {
                              event.stopPropagation();
                              removeLogo();
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      {errorLogoMessage && (
                        <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-base md:text-lg font-medium mb-2">
                    {t('label.return_delivery_information')}
                  </p>
                  {uiLangs.map((lang) => {
                    return (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                          <div className="col-span-2">
                            <p className="text-sm font-medium mb-1">{t('label.return_text')}</p>
                            <Textarea
                              id={`return_text_${lang.id}`}
                              {...register(`return_text_${lang.id}` as keyof ProductFormData)}
                              className="app-input min-h-10"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-sm font-medium mb-1">{t('label.return_in_days')}</p>
                            <Input
                              typeof="number"
                              defaultValue={
                                data?.return_in_days ? String(data?.return_in_days) : ''
                              }
                              id="return_in_days"
                              {...register('return_in_days' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-sm font-medium mb-1">{t('label.max_cart_qty')}</p>
                            <Input
                              defaultValue={data?.max_cart_qty ? String(data?.max_cart_qty) : ''}
                              type="number"
                              id="max_cart_qty"
                              {...register('max_cart_qty' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>

                          <div className="col-span-2 md:col-span-1">
                            <p className="text-sm font-medium mb-1">
                              {t('label.min_delivery_time')}
                            </p>
                            <Input
                              type="text"
                              defaultValue={
                                data?.delivery_time_min ? String(data?.delivery_time_min) : ''
                              }
                              id="delivery_time_min"
                              {...register('delivery_time_min' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-sm font-medium mb-1">
                              {t('label.max_delivery_time')}
                            </p>
                            <Input
                              type="text"
                              defaultValue={
                                data?.delivery_time_max ? String(data?.delivery_time_max) : ''
                              }
                              id="delivery_time_max"
                              {...register('delivery_time_max' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium mb-1">{t('label.delivery_note')}</p>
                            <Textarea
                              id={`delivery_time_text_${lang.id}`}
                              {...register(
                                `delivery_time_text_${lang.id}` as keyof ProductFormData,
                              )}
                              className="app-input min-h-10"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="mt-2 col-span-2 flex flex-wrap items-start gap-x-6 gap-y-3">
                            <div className="flex items-start gap-2 min-w-0">
                              <Checkbox
                                id="organic"
                                checked={cashOnDelivery}
                                onCheckedChange={(checked: boolean) => setCashOnDelivery(checked)}
                              />
                              <label
                                htmlFor="organic"
                                className="text-md font-medium leading-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t('label.cash_on_delivery')}
                              </label>
                              <InfoTooltip text={t('tooltip.ensure_products_are_eligible_cah_on_delivery')} side="right" />
                            </div>
                            <div className="flex items-start gap-2 min-w-0">
                              <Checkbox
                                id="halal"
                                checked={allowChange}
                                onCheckedChange={(checked: boolean) => setAllowChange(checked)}
                              />
                              <label
                                htmlFor="halal"
                                className="text-md font-medium leading-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t('label.allow_change_in_mind')}
                              </label>
                              <InfoTooltip text={t('tooltip.allow_change_in_mind')} side="right" />
                            </div>
                            <div className="flex items-start gap-2 min-w-0">
                              <Checkbox
                                id="free_shipping"
                                checked={freeShipping}
                                onCheckedChange={(checked: boolean) => setFreeShipping(checked)}
                              />
                              <label
                                htmlFor="free_shipping"
                                className="text-md font-medium leading-5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t('label.free_shipping')}
                              </label>
                              <InfoTooltip text={t('tooltip.free_shipping')} side="left" />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-4">
            <CardContent className="p-4">
              <p className="text-lg md:text-2xl font-medium mb-4">{t('label.product_variants')}s</p>
              <div>
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  <span>{t('label.attribute')}</span>
                  <InfoTooltip text={t('tooltip.please_select_attribute')} />
                </div>
                <Select
                  isMulti
                  name="attributes"
                  value={selectedAttributes}
                  styles={customStyles}
                  classNamePrefix="select"
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  className="basic-multi-select"
                  options={attributeOptions}
                  //@ts-ignore
                  onChange={onChangeMultiSelect}
                  formatOptionLabel={(option, { context }) => (
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {context === 'menu' &&
                        selectedAttributes.some((attr) => attr.value === option.value) && (
                          <span>
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                    </div>
                  )}
                />
              </div>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mt-4">
                {selectedAttributes.map((attribute) => (
                  <div key={attribute.value}>
                    <p className="text-sm font-medium mb-1">{attribute.label}</p>
                    <MultiSelectTagsInput
                      label={attribute.label}
                      //@ts-ignore
                      options={options[attribute.value] || []}
                      selectedValues={selectedValues[attribute.value] || []}
                      onChange={(newValue, actionMeta) =>
                        handleChange(newValue, actionMeta, attribute.value)
                      }
                      onCreateOption={(inputValue) =>
                        //@ts-ignore
                        handleCreate(inputValue, attribute.value)
                      }
                      placeholder={`Enter or select ${attribute.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Price Input Currency</p>
                    <AppSearchSelect
                      value={priceInputCurrency || defaultCurrency?.code || ''}
                      onSelect={(value) => setPriceInputCurrency(String(value || ''))}
                      groups={currencySelectOptions}
                      hideNone
                    />
                  </div>
                  <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-300 flex items-end">
                    Saved in base currency: {defaultCurrency?.code || '-'}
                  </div>
                </div>
                {!isSelectedValuesEmpty && combinations.length > 0 && (
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px] grid grid-cols-1 gap-2">
                      <div className="text-blue-500 bg-blue-50 dark:bg-gray-900 rounded shadow-lg py-2 px-4 grid grid-cols-7 gap-2">
                        <p className="col-span-2">{t('label.variant')}</p>
                        <p>{t('label.image')}</p>
                        <p>{t('label.seller_sku')}</p>
                        <p>{t('label.price')}</p>
                        <p>{t('label.special_price')}</p>
                        <p>{t('label.stock')}</p>
                      </div>
                      <Card className="relative shadow-lg p-2 rounded">
                        {combinations.map((combination, index) => {
                          const triggerLogo = (
                            <div className="hover:cursor-pointer">
                              {logoData[index]?.img_url ? (
                                <div className="relative w-12 h-12">
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={logoData[index]?.img_url}
                                    alt={(logoData[index]?.name as string) ?? 'variant_image'}
                                    fill
                                    sizes="48px"
                                    className="object-cover w-full h-full border dark:border-gray-500 rounded"
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-blue-500 p-2 text-center rounded cursor-pointer hover:bg-blue-50 transition-colors">
                                  <CloudUploadIcon className="h-6 w-6 text-blue-500" />
                                </div>
                              )}
                            </div>
                          );
                          return (
                            <div key={index} className=" grid grid-cols-7 gap-2 items-center p-2">
                              <p className="col-span-2">{combination}</p>
                              <div className="">
                                <div className="relative flex align-start gap-4">
                                  <div>
                                    <PhotoUploadModal
                                      trigger={triggerLogo}
                                      isMultiple={false}
                                      onSave={handleVariantsImage(index)}
                                      usageType="product"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Input
                                disabled
                                type="text"
                                className="app-input"
                                placeholder={t('place_holder.enter_value')}
                                value={sku[index] ?? ''}
                                onChange={(e) =>
                                  setSku((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                type="number"
                                min={0}
                                className="app-input"
                                placeholder={t('place_holder.enter_value')}
                                value={formatEditableAmount(prices[index])}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setPrices((prev) => ({
                                    ...prev,
                                    [index]:
                                      newValue === ''
                                        ? ('' as any)
                                        : Number(toDefaultCurrency(Number(newValue)).toFixed(6)),
                                  }));
                                }}
                              />

                              <Input
                                type="number"
                                min={0}
                                className="app-input"
                                placeholder={t('place_holder.enter_value')}
                                value={formatEditableAmount(spPrices[index])}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setSpPrices((prev) => ({
                                    ...prev,
                                    [index]:
                                      newValue === ''
                                        ? ('' as any)
                                        : Number(toDefaultCurrency(Number(newValue)).toFixed(6)),
                                  }));
                                }}
                              />
                              <Input
                                type="number"
                                min={0}
                                className="app-input"
                                placeholder={t('place_holder.enter_value')}
                                value={stocks[index] ?? ''}
                                onChange={(e) =>
                                  setStocks((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          );
                        })}
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {DynamicValues.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-lg md:text-2xl font-medium mb-4">Specification</p>
                <div className="grid grid-cols-2 gap-4 mt-1 mb-4">
                  {DynamicValues.length > 0 &&
                    DynamicValues?.map((field: any) => (
                      <div key={field.id} className="">
                        <p className="text-sm font-medium mb-1">
                          {field.name}{' '}
                          {field.is_required && <span className="text-red-500 mx-0.5">*</span>}
                        </p>

                        {field.type === 'select' && specificationsState[field.slug] && (
                          <AppSearchSelect
                            value={specificationsState[field.slug]}
                            onSelect={(value) => handleSpecificationChange(field.slug, value)}
                            groups={field.values ?? []}
                            hideNone
                          />
                        )}
                        {field.type === 'select' && !specificationsState[field.slug] && (
                          <AppSearchSelect
                            value={specificationsState[field.slug] ?? ''}
                            onSelect={(value) => handleSpecificationChange(field.slug, value)}
                            groups={field.values ?? []}
                          />
                        )}

                        {field.type === 'multiselect' && (
                          <Select
                            isMulti
                            name={field.slug}
                            isDisabled={field.values.length === 0}
                            value={
                              specificationsState[field.slug]
                                ? field.values.filter((opt: any) =>
                                    (
                                      specificationsState[field.slug] as unknown as string[]
                                    ).includes(opt.value),
                                  )
                                : []
                            }
                            styles={customStyles}
                            classNamePrefix="select"
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            className="basic-multi-select"
                            options={field.values}
                            // @ts-ignore
                            onChange={(selected: any) =>
                              handleSpecificationChange(
                                field.slug,
                                selected ? selected.map((s: any) => s.value) : [],
                              )
                            }
                            formatOptionLabel={(option: any, { context }: any) => (
                              <div className="flex items-center justify-between">
                                <span>{option.label}</span>
                                {context === 'menu' &&
                                  (
                                    specificationsState[field.slug] as unknown as string[]
                                  )?.includes(option.value) && (
                                    <span>
                                      <Check className="w-4 h-4" />
                                    </span>
                                  )}
                              </div>
                            )}
                          />
                        )}
                        {field.type === 'text' && (
                          <Input
                            type="text"
                            defaultValue={specificationsState[field.slug] ?? ''}
                            onChange={(e) => handleSpecificationChange(field.slug, e.target.value)}
                            className="app-input"
                            placeholder="Enter value"
                          />
                        )}
                        {field.type === 'boolean' && (
                          <RadioGroup
                            className="flex items-center gap-4 mt-2"
                            value={specificationsState[field.slug] ?? ''}
                            onValueChange={(value) => handleSpecificationChange(field.slug, value)}
                          >
                            {field.values.map((option: any) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  className="text-blue-500 border-blue-500"
                                  value={option.value}
                                  id={`${field.slug}-${option.id}`}
                                />
                                <Label htmlFor={`${field.slug}-${option.id}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        {field.type === 'checkbox' && (
                          <div className="grid grid-cols-4 gap-2">
                            {field.values.map((option: any) => {
                              const isChecked = (
                                specificationsState[field.slug] as unknown as string[]
                              )?.includes(option.value);

                              return (
                                <label
                                  key={option.id}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 border rounded"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentValues =
                                        (specificationsState[field.slug] as unknown as string[]) ||
                                        [];
                                      let updatedValues;

                                      if (e.target.checked) {
                                        updatedValues = [...currentValues, option.value];
                                      } else {
                                        updatedValues = currentValues.filter(
                                          (val) => val !== option.value,
                                        );
                                      }

                                      handleSpecificationChange(
                                        field.slug,
                                        //@ts-ignore
                                        updatedValues,
                                      );
                                    }}
                                  />
                                  <span>{option.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {field.type === 'date' && (
                          <div className="grid grid-cols-3 items-center gap-2">
                            {/* Date Picker */}
                            <div className="col-span-2">
                              <CustomSingleDatePicker
                                label=""
                                selectedDate={
                                  specificationsState[field.slug]
                                    ? parse(
                                        specificationsState[field.slug].split(' ')[0], // take date part
                                        'yyyy-MM-dd',
                                        new Date(),
                                      )
                                    : null
                                }
                                onChange={(date) => {
                                  const currentValue = specificationsState[field.slug] || '';
                                  const timePart = currentValue.split(' ')[1] || '00:00'; // default time
                                  handleSpecificationChange(
                                    field.slug,
                                    date ? `${format(date, 'yyyy-MM-dd')} ${timePart}` : '',
                                  );
                                }}
                              />
                            </div>

                            {/* Time Input */}
                            <Input
                              type="time"
                              value={
                                specificationsState[field.slug]
                                  ? specificationsState[field.slug].split(' ')[1] || '00:00'
                                  : '00:00'
                              }
                              onChange={(e) => {
                                const currentValue = specificationsState[field.slug] || '';
                                const datePart =
                                  currentValue.split(' ')[0] || format(new Date(), 'yyyy-MM-dd'); // fallback to today
                                handleSpecificationChange(
                                  field.slug,
                                  `${datePart} ${e.target.value}`,
                                );
                              }}
                              className="app-input flex flex-col"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton
              UpdateData={data}
              IsLoading={isPending || isUpdating}
              AddLabel={t('button.add_product')}
              UpdateLabel={t('button.update_product')}
            />
          </Card>
      </Tabs>
      )}
      </form>
    </div>
  );
};
export default CreateOrUpdateProductForm;
