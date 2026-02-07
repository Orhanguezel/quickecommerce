// src/components/blocks/admin-section/products/CreateOrUpdateProductForm.tsx

'use client';
import { AppNestedDropdown } from '@/components/blocks/common';
import MultiSelectTagsInput from '@/components/blocks/common/MultiSelectTagsInput';
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
import { useBrandsQuery } from '@/modules/common/brand/brand.action';
import { useCategoriesQuery } from '@/modules/common/category/category.action';
import { useUnitQuery } from '@/modules/common/unit/unit.action';

import CloudIcon from '@/assets/icons/CloudIcon';
import { AppSearchSelect } from '@/components/blocks/common/AppSearchSelect';
import TiptapEditor from '@/components/blocks/common/TiptapField';
import { TagsInput } from '@/components/ui/tags-input';
import GlobalImageLoader from '@/lib/imageLoader';
import {
  useDynamicFieldQueryAdmin,
  useProductDescriptionGenerate,
  useProductStoreMutation,
  useProductUpdateMutation,
} from '@/modules/admin-section/products/product.action';
import { ProductFormData, productSchema } from '@/modules/admin-section/products/product.schema';
import { useSellerStoreQuery } from '@/modules/admin-section/seller-store/seller-store.action';
import { useSellerQuery } from '@/modules/admin-section/seller/seller.action';
import { useGeneralQuery } from '@/modules/common/com/com.action';
import { useProductAttributeQuery } from '@/modules/seller-section/product-attribute/product-attribute.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/index';
import { setRefetch } from '@/redux/slices/refetchSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Check, CloudUploadIcon, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import Select, { ActionMeta, MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import CustomSingleDatePicker from '../../common/CustomSingleDatePicker';
import Cancel from '../../custom-icons/Cancel';
import ProductDescriptionGenerateModal from './modal/ProductDescriptionGenerateModal';

// JSON scaffold stack (standard)
import {
  AdminI18nJsonPanel,
  makeRHFSetValueAny,
  safeObject,
  ensureLangKeys,
  useFormI18nScaffold,
  initI18nFlatFormFromEntity,
  normalizeTranslationsMap,
} from '@/lib/json';
import type { LangKeys, ViewMode } from '@/lib/json';

/** Simple CSS tooltip — replaces Radix Tooltip (compose-refs crash in React 19) */
const InfoTooltip = ({ text, side = 'top' }: { text: string; side?: 'top' | 'right' }) => (
  <div className="relative group inline-flex">
    <Info className="w-4 text-custom-dark-blue dark:text-white cursor-pointer" />
    <div
      className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity px-3 py-2 text-sm font-medium rounded-md shadow-md pointer-events-none bg-custom-dark-blue dark:bg-white text-white dark:text-black max-w-sm w-max ${
        side === 'right'
          ? 'left-full top-1/2 -translate-y-1/2 ml-2'
          : 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      }`}
    >
      {text}
    </div>
  </div>
);

interface Option {
  value: string;
  label: string;
}
interface SelectCategory {
  [key: string]: ReadonlyArray<Option>;
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

const CreateOrUpdateProductForm = ({ data }: any) => {
  const t = useTranslations();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [shouldSellerStoreRefetch, setShouldSellerStoreRefetch] = useState(false);
  const dispatch = useAppDispatch();
  const localeMain = useLocale();
  const allLangs = useMemo(() => (Array.isArray(multiLang) ? (multiLang as any[]) : []), []);
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const editData = useMemo(() => (data?.data ?? data?.product ?? data) as any, [data]);
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const warrantyData = editData ? JSON.parse(editData?.warranty) : [];
  const formatDateTime = (dateTime: string) => dateTime?.replace(' ', 'T').slice(0, 16);
  let warrantyPeriod = warrantyData?.[0]?.warranty_period
    ? String(warrantyData?.[0]?.warranty_period)
    : '';

  const {
    watch,
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_df: '',
      description_df: '',
      meta_title_df: '',
      meta_description_df: '',
      meta_keywords_df: [],
      return_text_df: '',
      delivery_time_text_df: '',
    } as any,
  });

  const setValueAny = useMemo(() => makeRHFSetValueAny<ProductFormData>(setValue), [setValue]);

  const i18n = useFormI18nScaffold<ProductFormData>({
    languages: allLangs,
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
        { dfField: 'delivery_time_text_df', srcField: (l) => `delivery_time_text_${l}`, validate: false },
      ],
    },
  });

  const {
    uiLangs,
    firstUILangId,
    translationsJson,
    handleTranslationsJsonChange,
    rebuildJsonNow,
  } = i18n;

  const handleProductJsonChange = (next: any) => {
    const safe = ensureLangKeys(safeObject(next), uiLangs);
    const base =
      safe?.[firstUILangId] && typeof safe[firstUILangId] === 'object'
        ? safe[firstUILangId]
        : {};

    const out: Record<string, any> = { ...safe };
    for (const lang of uiLangs) {
      const cur =
        safe?.[lang.id] && typeof safe[lang.id] === 'object' ? safe[lang.id] : {};
      const merged: Record<string, any> = { ...cur };
      for (const f of I18N_FIELDS) {
        if (merged[f] === undefined) merged[f] = (base as any)?.[f];
      }
      out[lang.id] = merged;
    }

    handleTranslationsJsonChange(out);
  };

  const [activeLangId, setActiveLangId] = useState<string>(() => {
    const fromLocale = uiLangs.find((l) => l.id === locale)?.id;
    return fromLocale ?? uiLangs?.[0]?.id ?? 'tr';
  });

  useEffect(() => {
    const exists = uiLangs.some((l) => l.id === activeLangId);
    if (!exists) setActiveLangId(uiLangs?.[0]?.id ?? 'tr');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLangs.map((l) => l.id).join('|')]);

  useEffect(() => {
    if (viewMode === 'json') rebuildJsonNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

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

  const watchedType = useWatch({ control, name: 'type' });
  const watchedSellerId = useWatch({ control, name: 'seller_id' });
  const firstLangMetaKeywords = useWatch({
    control,
    name: `meta_keywords_${firstUILangId}` as any,
  });
  useEffect(() => {
    // When firstUILangId is 'df', the watched field IS meta_keywords_df — writing
    // to the same field creates an infinite loop. Skip in that case.
    if (firstUILangId === 'df') return;
    if (Array.isArray(firstLangMetaKeywords)) {
      setValueAny('meta_keywords_df', firstLangMetaKeywords, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLangMetaKeywords, setValueAny, firstUILangId]);

  useEffect(() => {
    uiLangs.forEach((l) => {
      I18N_FIELDS.forEach((f) => register(`${f}_${l.id}` as any));
    });
  }, [uiLangs, register]);

  const [isOrganic, setIsOrganic] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [attributeValuesKey, setAttributeValuesKey] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState<Option[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, Option[]>>({});
  const [options, setOptions] = useState<SelectCategory>({});

  const { sellerList } = useSellerQuery({});
  const { categories, refetch: CategoryRefetch } = useCategoriesQuery({
    pagination: false,
    type: watchedType,
  });
  const { brands } = useBrandsQuery({});
  const { units } = useUnitQuery({});
  const { productAttribute, refetch } = useProductAttributeQuery({
    type: watchedType,
  });

  const { sellerStoreList, refetch: sellerStoreRefetch } = useSellerStoreQuery(
    watchedSellerId && watchedSellerId !== 'undefined'
      ? { seller_id: watchedSellerId }
      : {},
  );

  let originalData = (categories as any)?.data || [];

  let brandData = (brands as any) || [];
  let sellerData = (sellerList as any) || [];
  let sellerStoreData = (sellerStoreList as any) || [];
  let unitData = (units as any) || [];
  const attributeOptions = useMemo(() => {
    return (productAttribute as any) || [];
  }, [productAttribute]);
  const { general, refetch: generalRefetch } = useGeneralQuery({
    language: localeMain,
  });
  const originalDataGeneral = useMemo(() => {
    const data = (general as any) || {};
    return data;
  }, [general]);

  const GeneralData = originalDataGeneral.site_settings;

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      CategoryRefetch();
      setShouldRefetch(false);
    }
    if (shouldSellerStoreRefetch) {
      sellerStoreRefetch();
      setShouldSellerStoreRefetch(false);
    }
  }, [shouldRefetch, shouldSellerStoreRefetch, refetch, CategoryRefetch, sellerStoreRefetch]);

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
          setAttributeValuesKey(key);
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
              //@ts-ignore
              value: value,
              //@ts-ignore
              label: value,
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
      const firstObject = Object.values(initialLogoData)[0];
      setLogoData((prev) => ({ ...prev, [index]: firstObject }));
    });

    setSelectedAttributes(newSelectedAttributes);
    setSelectedValues(newSelectedValues);
  };

  useEffect(() => {
    if (!editData) {
      rebuildJsonNow();
      return;
    }

    populateStatesFromApi(editData?.variants);
    const categoryData = editData?.category;

    setValueAny('name_df', editData?.name ?? '');
    setValueAny('description_df', editData?.description ?? '');
    setValueAny('meta_title_df', editData?.meta_title ?? '');
    const dfTags = editData?.meta_keywords == 'null' ? [] : splitTags(editData?.meta_keywords);
    setValueAny('meta_keywords_df', dfTags ?? []);
    setValueAny('meta_description_df', editData?.meta_description ?? '');
    setValueAny('return_text_df', editData?.return_text ?? '');
    setValueAny('delivery_time_text_df', editData?.delivery_time_text ?? '');
    setValueAny('brand_id', String(editData?.brand?.id ?? ''));
    setValueAny('seller_id', String(editData?.seller?.id ?? ''));
    setValueAny('store_id', String(editData?.store?.id ?? ''));
    setValueAny('type', editData?.type ?? '');
    setValueAny('unit_id', String(editData?.unit?.id ?? ''));
    if (categoryData) {
      setfinalSelectedID(categoryData?.id);
      const pathName = categoryData?.category_name_paths;
      const pathNameArray = pathName === null ? [] : pathName?.split('/');
      setSelectedItems(pathNameArray);
      const pathIds = categoryData?.parent_path;
      const pathIDsArray = pathIds === null ? [] : pathIds?.split('/');
      setSelectedIDs(pathIDsArray);
    }

    initI18nFlatFormFromEntity({
      editData,
      firstUILangId,
      uiLangs,
      i18nFields: [...I18N_FIELDS],
      setValueAny,
      after: () => {
        const trMap = normalizeTranslationsMap(editData?.translations, I18N_FIELDS);
        for (const lang of uiLangs) {
          const tagsArray = splitTags(trMap?.[lang.id]?.meta_keywords);
          setValueAny(`meta_keywords_${lang.id}`, tagsArray ?? [], {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
        rebuildJsonNow();
      },
    });

    if (editData?.image !== 0 && editData?.image !== null) {
      setLastSelectedLogo({
        image_id: editData?.image ? editData?.image : '',
        img_url: editData?.image_url ? editData?.image_url : '/images/no-image.png',
        name: 'image',
      });
    }
    const cashOnDelivery = editData?.cash_on_delivery == 1 ? true : false;
    const allowChangeInMind = editData?.allow_change_in_mind == 1 ? true : false;
    setIsOrganic(cashOnDelivery);
    setIsHalal(allowChangeInMind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, firstUILangId]);

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
    setValueAny(inputType as any, value);
    if (inputType === 'store_id') {
      const selectedStore = sellerStoreData.find(
        (store: { value: number }) => store.value === parseInt(value),
      );
      if (selectedStore) {
        setValueAny('type', selectedStore.store_type);
      }
      setValueAny('category', '');
      setSelectedItems([]);
      setSelectedAttributes([]);
      setSelectedValues({});
    }
    if (inputType == 'type') {
      setShouldRefetch(true);
    }
    if (inputType == 'seller_id') {
      setShouldSellerStoreRefetch(true);
    }
    if (value == 'none') {
      setValueAny(inputType as any, '');
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
      id: editData ? editData?.id : '',
      category_id: finalSelectedID,
      name: values.name_df,
      description: values.description_df,
      meta_title: values.meta_title_df,
      meta_description: values.meta_description_df,
      meta_keywords: values.meta_keywords_df,
      return_text: values.return_text_df,
      delivery_time_text: values.delivery_time_text_df,
      cash_on_delivery: isOrganic ? 1 : 0,
      allow_change_in_mind: isHalal ? 1 : 0,
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
        return_text: (values as any)[`return_text_${lang.id}`],
        delivery_time_text: (values as any)[`delivery_time_text_${lang.id}`],
        meta_keywords: ((values as any)[`meta_keywords_${lang.id}`] || []).join(', '),
      }));

    const translations_json = ensureLangKeys(safeObject(translationsJson), uiLangs);

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
      const matchingEditData = editData?.variants?.find((item: { attributes: string }) => {
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
        special_price: spPrices[index] || 0,
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
      return toast.error(`Minimum one variant must be required`);
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
      const attribute = attributeOptions.find((attr: { value: string }) => attr.value == key);
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

    //@ts-ignore
    setCombinations(allCombinations);
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
            ? '#334155' // selected bg in dark
            : '#e5e7eb' // selected bg in light
          : state.isFocused
            ? dark
              ? '#1e293b' // hover bg in dark
              : '#f3f4f6' // hover bg in light
            : 'transparent',
        color: dark ? '#f1f5f9' : '#000', // text color
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
            alt={lastSelectedLogo?.name as string}
            fill
            sizes="128px"
            className="object-cover w-full h-full border dark:border-gray-500 rounded"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="text-sm font-bold text-red-500 p-1">{t('common.change_image')}</p>
          </div>
        </div>
      ) : (
        <div className=" w-32 h-32 border-2 border-dashed border-blue-500 text-center rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <CloudIcon />
            <p className="mt-4 text-blue-500 text-sm font-medium p-1">
              {t('common.drag_and_drop')}
            </p>
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

  const { DynamicFieldList } = useDynamicFieldQueryAdmin({
    store_type: watchedType,
  });
  const DynamicValues = useMemo(() => {
    return (DynamicFieldList as any)?.data ?? {};
  }, [DynamicFieldList]);

  const [specificationsState, setSpecificationsState] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const specificationsEditData = editData?.specifications;
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
            // backend gives "val1,val2" → convert to ["val1","val2"]
            newValue = existingSpec.value.split(',').map((v: string) => v.trim());
          } else if (Array.isArray(existingSpec?.custom_value)) {
            // just in case API sends array (fallback)
            newValue = existingSpec.custom_value;
          } else {
            newValue = [];
          }
        } else if (field.type === 'checkbox') {
          if (typeof existingSpec?.value === 'string') {
            // backend sends "male,female" → convert to array
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DynamicValues, editData]);

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
    const payload = { prompt };
    setLoading(true);

    GenerateDescription(payload as any, {
      onSuccess: (res: any) => {
        const generatedText = res?.data?.generated_content ?? '';
        setValueAny(`description_${langId}`, generatedText);
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
        {/* ✅ DF hidden required by schema */}
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
              {editData ? t('button.update_product') : t('button.add_product')}
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
                languages={uiLangs}
                value={translationsJson}
                onChange={handleProductJsonChange}
                perLanguage={true}
                showAllTab={true}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs
            value={activeLangId}
            onValueChange={(v) => setActiveLangId(String(v))}
            className=""
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
            <div className="col-span-1 xl:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-lg md:text-2xl font-medium mb-4">
                    {t('label.basic_information')}
                  </p>

                  <TabsList
                    dir={dir}
                    className="flex justify-start bg-white dark:bg-[#1f2937] mb-2 p-0"
                  >
                  {uiLangs.map((lang) => (
                      <TabsTrigger key={lang.id} value={lang.id}>
                        {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div
                    dir={dir}
                    className="grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-1 gap-4"
                  >
                    <div>
                      {uiLangs.map((lang) => {
                        return (
                          <TabsContent key={lang.id} value={lang.id}>
                            <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  {t('label.seller')}
                                  <span className="text-red-500 mx-0.5">*</span>
                                </p>
                                <Controller
                                  control={control}
                                  name="seller_id"
                                  defaultValue={
                                    editData && editData?.seller?.id ? String(editData?.seller?.id) : ''
                                  }
                                  render={({ field }) => (
                                    <AppSearchSelect
                                      value={String(field.value ?? '')}
                                      onSelect={(value) => {
                                        field.onChange(value);
                                        handleSelectItem(value, 'seller_id');
                                      }}
                                      groups={sellerData}
                                    />
                                  )}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  {t('label.store')}
                                  <span className="text-red-500 mx-0.5">*</span>
                                </p>
                                <Controller
                                  control={control}
                                  name="store_id"
                                  defaultValue={
                                    editData && editData?.store?.id ? String(editData?.store?.id) : ''
                                  }
                                  render={({ field }) => (
                                    <AppSearchSelect
                                      value={String(field.value ?? '')}
                                      onSelect={(value) => {
                                        field.onChange(value);
                                        handleSelectItem(value, 'store_id');
                                      }}
                                      groups={sellerStoreData}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>{t('label.category')} </span>
                                <span className="text-red-500 mx-0.5">*</span>
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
                                  {t('label.product_name')} (
                                  {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                                  <span className="text-red-500 mx-0.5">*</span>
                                </span>
                              </p>
                              <Input
                                id={`name_${lang.id}`}
                                {...register(`name_${lang.id}` as keyof ProductFormData)}
                                className="app-input"
                                placeholder={t('place_holder.enter_product_name')}
                              />
                              {errors[`name_${lang.id}` as keyof ProductFormData] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    //@ts-ignore
                                    errors[`name_${lang.id}`]?.message
                                  }
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
                                  defaultValue={editData?.video_url ? String(editData?.video_url) : ''}
                                  id="video_url"
                                  {...register('video_url' as keyof ProductFormData)}
                                  className="app-input"
                                  placeholder={t('place_holder.youtube_embed_code')}
                                />
                                {errors[`video_url` as keyof ProductFormData] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      //@ts-ignore
                                      errors[`video_url`]?.message
                                    }
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
                                placeholder={t('place_holder.enter_meta_title')}
                              />
                            </div>
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-1 flex items-center gap-2">
                                <span>
                                  {' '}
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
                                className="app-input "
                                placeholder={t('place_holder.enter_meta_description')}
                              />
                            </div>
                          </TabsContent>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="">
                    <div className="">
                      <p className="text-sm font-medium mb-1">{t('label.type')}</p>
                      <p className="bg-gray-50 min-h-10 dark:bg-gray-900 w-full rounded-md px-2 p-1.5 border border-slate-300 dark:border-[#475569] capitalize">
                        {watchedType && watchedType}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-lg font-medium">{t('label.unit_brand')}</p>
                    <div className="">
                      <p className="text-sm font-medium mb-1">{t('label.unit')}</p>
                      <Controller
                        control={control}
                        name="unit_id"
                        defaultValue={editData && editData?.unit?.id ? String(editData.unit.id) : ''}
                        render={({ field }) => (
                          <>
                            <AppSearchSelect
                              value={String(field.value ?? '')}
                              onSelect={(value) => {
                                field.onChange(value || '');
                                handleSelectItem(value || '', 'unit_id');
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
                        defaultValue={editData && editData?.brand?.id ? String(editData.brand.id) : ''}
                        render={({ field }) => (
                          <AppSearchSelect
                            value={field.value ?? ''}
                            onSelect={(value) => {
                              field.onChange(value || '');
                              handleSelectItem(value || '', 'brand_id');
                            }}
                            groups={brandData}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                          selectedImage={lastSelectedLogo}
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
                        {errorLogoMessage && (
                          <p className="text-red-500 text-sm mt-1">{errorLogoMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-base md:text-lg font-medium mb-3">
                    {t('label.return_delivery_information')}
                  </p>
                  {uiLangs.map((lang) => {
                    return (
                      <TabsContent key={lang.id} value={lang.id}>
                        <div className="grid grid-cols-2 gap-3 ">
                          <div className="col-span-2">
                            <p className="text-sm font-medium mb-1">
                              {t('label.return_text')} ({t(`lang.${lang.id}` as `lang.${LangKeys}`)}
                              )
                            </p>
                            <Textarea
                              id={`return_text_${lang.id}`}
                              {...register(`return_text_${lang.id}` as keyof ProductFormData)}
                              className="app-input min-h-10"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.return_in_days')}</p>
                            <Input
                              typeof="number"
                              defaultValue={
                                editData?.return_in_days ? String(editData?.return_in_days) : ''
                              }
                              id="return_in_days"
                              {...register('return_in_days' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">{t('label.max_cart_qty')}</p>
                            <Input
                              defaultValue={editData?.max_cart_qty ? String(editData?.max_cart_qty) : ''}
                              type="number"
                              id="max_cart_qty"
                              {...register('max_cart_qty' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.min_delivery_time')}
                            </p>
                            <Input
                              type="text"
                              defaultValue={
                                editData?.delivery_time_min ? String(editData?.delivery_time_min) : ''
                              }
                              id="delivery_time_min"
                              {...register('delivery_time_min' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {t('label.max_delivery_time')}
                            </p>
                            <Input
                              type="text"
                              defaultValue={
                                editData?.delivery_time_max ? String(editData?.delivery_time_max) : ''
                              }
                              id="delivery_time_max"
                              {...register('delivery_time_max' as keyof ProductFormData)}
                              className="app-input"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium mb-1">
                              {t('label.delivery_note')} (
                              {t(`lang.${lang.id}` as `lang.${LangKeys}`)})
                            </p>
                            <Textarea
                              id={`delivery_time_text_${lang.id}`}
                              {...register(
                                `delivery_time_text_${lang.id}` as keyof ProductFormData,
                              )}
                              className="app-input min-h-10"
                              placeholder={t('place_holder.enter_value')}
                            />
                          </div>
                          <div className="mt-2 col-span-2 flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="organic"
                                checked={isOrganic}
                                onCheckedChange={(checked: boolean) => setIsOrganic(checked)}
                              />
                              <label
                                htmlFor="organic"
                                className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t('label.cash_on_delivery')}
                              </label>
                              <InfoTooltip text={t('tooltip.ensure_products_are_eligible_cah_on_delivery')} side="right" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="halal"
                                checked={isHalal}
                                onCheckedChange={(checked: boolean) => setIsHalal(checked)}
                              />
                              <label
                                htmlFor="halal"
                                className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {t('label.allow_change_in_mind')}
                              </label>
                              <InfoTooltip text={t('tooltip.allow_change_in_mind')} side="right" />
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
              <p className="text-lg md:text-2xl font-medium mb-4">{t('label.product_variants')}</p>
              <div>
                <div className="text-sm font-medium mb-1 flex items-center gap-1">
                  <p className="flex items-center">
                    {t('label.attribute')} <span className="text-red-500 mx-0.5">*</span>
                  </p>
                  <InfoTooltip text={t('tooltip.please_select_attribute')} side="right" />{' '}
                </div>
                <Select
                  isMulti
                  name="attributes"
                  isDisabled={attributeOptions.length === 0}
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
                        selectedAttributes.some((attr) => attr.value == option.value) && (
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
                    <p className="text-sm font-medium mb-1">
                      {attribute.label} <span className="text-red-500 mx-0.5">*</span>
                    </p>

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
                            <div key={index} className="hover:cursor-pointer">
                              {logoData[index]?.img_url ? (
                                <div className="relative w-12 h-12">
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={logoData[index]?.img_url}
                                    alt={(logoData[index]?.name as string) || 'logo'}
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
                                className="app-input"
                                placeholder={t('place_holder.enter_value')}
                                min={0}
                                value={prices[index] ?? ''}
                                onChange={(e) =>
                                  setPrices((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                type="number"
                                className="app-input"
                                min={0}
                                placeholder={t('place_holder.enter_value')}
                                value={spPrices[index] ?? ''}
                                onChange={(e) =>
                                  setSpPrices((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                type="number"
                                className="app-input"
                                min={0}
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
        </Tabs>
        )}

        <Card className="mt-4 sticky bottom-0 w-full p-4">
          <SubmitButton
            UpdateData={editData}
            IsLoading={isPending || isUpdating}
            AddLabel={t('button.add_product')}
            UpdateLabel={t('button.update_product')}
          />
        </Card>
      </form>
    </div>
  );
};
export default CreateOrUpdateProductForm;
