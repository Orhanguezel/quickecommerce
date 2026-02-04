'use client';
import Loader from '@/components/molecules/Loader';
import { AppSelect } from '@/components/blocks/common';
import { SubmitButton } from '@/components/blocks/shared';
import { Card, CardContent, Input } from '@/components/ui';
import { useRolesUpdateMutation } from '@/modules/admin-section/roles/roles.action';
import { RoleFormData, rolesSchema } from '@/modules/admin-section/roles/roles.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Option {
  label: string;
  value: boolean;
}

const groups = [
  { label: 'System Owner/Users', value: 'system_level' },
  { label: 'Store Owner/Users', value: 'store_level' },
];
const UpdateRoleForm = ({ data, isPending: isQuerying }: any) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [availableFor, setAvailableFor] = useState('system_level');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useForm<RoleFormData>({
    resolver: zodResolver(rolesSchema),
  });
  const watchedPermissions = watch();

  const [updatedPermissions, setUpdatedPermissions] = useState<PermissionNode[]>([]);

  useEffect(() => {
    if (data) {
      setValue('role_name', data?.name);
      setValue('available_for', data?.available_for);
      setAvailableFor(data?.available_for);
      if (data?.permissions) {
        setUpdatedPermissions(data.permissions);
        const checkAllSelected = (nodes: PermissionNode[]): boolean => {
          return nodes.every((node) => {
            const currentOptionsSelected = node.options
              ? node.options.every((opt) => opt.value)
              : true;
            const childrenSelected = node.children ? checkAllSelected(node.children) : true;

            return currentOptionsSelected && childrenSelected;
          });
        };

        const allSelected = checkAllSelected(data.permissions);
        setSelectAll(allSelected);
      }
    }
  }, [data, setValue, data?.permissions]);
  useEffect(() => {
    const checkAllSelected = (nodes: PermissionNode[]): boolean => {
      return nodes.every((node) => {
        const currentOptionsSelected = node.options ? node.options.every((opt) => opt.value) : true;

        const childrenSelected = node.children ? checkAllSelected(node.children) : true;

        return currentOptionsSelected && childrenSelected;
      });
    };

    const allSelected = checkAllSelected(updatedPermissions);
    setSelectAll(allSelected);
  }, [updatedPermissions]);

  const handleAvailableFor = (value: string, inputType: string) => {
    setValue(inputType as any, value);
    setAvailableFor(value);
  };

  const findNodeById = (nodes: any[], id: number): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNodeAndChildren = (node: any, optionLabel: string | null, value: boolean) => {
    if (node.options) {
      node.options.forEach((opt: any) => {
        if (!optionLabel || opt.label === optionLabel) {
          opt.value = value;
        }
      });
    }
    if (node.children) {
      node.children.forEach((child: any) => updateNodeAndChildren(child, optionLabel, value));
    }
  };

  const updateParentNodes = (nodes: any[], nodeId: number, optionLabel: string) => {
    const updateParents = (currentNodes: any[], targetId: number): boolean => {
      for (const node of currentNodes) {
        if (node.children) {
          const childHasTarget = node.children.some((child: any) => child.id === targetId);

          if (childHasTarget) {
            // Update parent's view option if any child option is true
            const viewOption = node.options.find((opt: any) => opt.label === 'view');
            if (viewOption) {
              viewOption.value = node.children.some((child: any) =>
                child.options?.some((opt: any) => opt.value),
              );
            }
            return true;
          }

          const foundInChildren = updateParents(node.children, targetId);
          if (foundInChildren) {
            // Update parent's view option if any child option is true
            const viewOption = node.options.find((opt: any) => opt.label === 'view');
            if (viewOption) {
              viewOption.value = node.children.some((child: any) =>
                child.options?.some((opt: any) => opt.value),
              );
            }
            return true;
          }
        }
      }
      return false;
    };

    updateParents(nodes, nodeId);
  };

  const handleSelectAll = (e: any, id: number) => {
    const optionValue = e.target.checked;

    setUpdatedPermissions((prevData: any) => {
      const updatedData = [...prevData];
      const node = findNodeById(updatedData, id);
      if (node) {
        updateNodeAndChildren(node, null, optionValue);

        // Update all parent nodes
        if (node.options) {
          node.options.forEach((opt: any) => {
            updateParentNodes(updatedData, id, opt.label);
          });
        }
      }
      return updatedData;
    });
  };

  const handleSelectPermission = (e: any, id: number, option: any) => {
    const optionValue = e.target.checked;
    setUpdatedPermissions((prevData: any) => {
      const updatedData = [...prevData];
      const node = findNodeById(updatedData, id);
      if (node && node.options) {
        const opt = node.options.find((o: any) => o.label === option.label);
        if (opt) {
          opt.value = optionValue;
        }
        // This will now update parent's view based on any child option
        updateParentNodes(updatedData, id, option.label);

        if (!optionValue) {
          if (node.children) {
            node.children.forEach((child: any) => {
              const childOpt = child.options?.find((o: any) => o.label === option.label);
              if (childOpt) {
                childOpt.value = false;
              }
            });
          }
        }
      }
      return updatedData;
    });
  };

  const [selectAll, setSelectAll] = useState(false);

  interface PermissionOption {
    label: string;
    value: boolean;
  }

  interface PermissionNode {
    id: number;
    perm_title: string;
    options?: PermissionOption[];
    children?: PermissionNode[];
  }

  const handleSelectAllPermissions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    setUpdatedPermissions((prevPermissions: PermissionNode[]) => {
      const updateAllPermissions = (nodes: PermissionNode[]): PermissionNode[] => {
        return nodes.map((node: PermissionNode) => {
          // Update current node's options
          const updatedOptions: PermissionOption[] =
            node.options?.map((option: PermissionOption) => ({
              ...option,
              value: isChecked,
            })) || [];

          // Update children recursively
          const updatedChildren: PermissionNode[] = node.children
            ? updateAllPermissions(node.children)
            : [];

          return {
            ...node,
            options: updatedOptions,
            children: updatedChildren,
          };
        });
      };

      return updateAllPermissions(prevPermissions);
    });
  };

  const filterOptions = (node: any, result: any[] = []) => {
    const optionResult: { id: any; [key: string]: any } = {
      id: node.id,
    };
    node.options.forEach((option: { label: string; value: boolean }) => {
      if (option.value === true) {
        const key = option.label.toLowerCase();
        optionResult[key] = true;
      }
    });
    if (Object.keys(optionResult).length > 1) {
      result.push(optionResult);
    }
    node.children.forEach((child: any) => filterOptions(child, result));

    return result;
  };

  const { mutate: rolesAssign, isPending } = useRolesUpdateMutation();

  const onSubmit = (values: RoleFormData) => {
    let PerData: any = [];
    updatedPermissions.forEach((item: any) => {
      PerData = filterOptions(item, PerData);
    });
    const submissionData = {
      role_id: data ? data?.id : '',
      role_name: values.role_name,
      available_for: values.available_for,
      permissions: PerData,
    };

    // Submit the data
    rolesAssign(submissionData, {
      onSuccess: () => {},
    });
  };
  if (isQuerying) {
    return <Loader customClass="mt-10" size="large" />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div dir={dir} className="grid grid-cols-1 gap-4 ">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-lg md:text-2xl font-medium mb-4">{t('label.basic_information')}</p>
              <div>
                <p className="text-sm font-medium">{t('label.name')}</p>
                <Input
                  type="text"
                  id="role_name"
                  {...register('role_name' as keyof RoleFormData)}
                  className="app-input"
                  placeholder={t('place_holder.enter_role_name')}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">{t('label.available_for')}</p>
                <Controller
                  control={control}
                  name="available_for"
                  defaultValue={data && data.id > 0 ? data.available_for : availableFor}
                  render={({ field }) => (
                    <>
                      <AppSelect
                        disabled={data?.id > 0}
                        value={String(field.value ?? '')}
                        onSelect={(value: string) => {
                          field.onChange(value);
                          handleAvailableFor(value, 'available_for');
                        }}
                        groups={groups}
                      />
                    </>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg md:text-2xl font-medium">{t('label.permissions')}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="selectAllPermissions"
                      checked={selectAll}
                      onChange={handleSelectAllPermissions}
                      className="cursor-pointer"
                    />
                    <label htmlFor="selectAllPermissions" className="cursor-pointer">
                      {t('label.select_all')}
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px]">
                  {updatedPermissions.map((permission: any) => (
                    <div key={permission?.id}>
                      <div className="" key={permission?.id}>
                        <div
                          className={`${
                            permission?.children?.length === 0 &&
                            'flex items-center justify-between'
                          }  `}
                        >
                          <h3
                            className={`text-blue-500 dark:text-white ${
                              permission?.children?.length === 0
                                ? 'p-3'
                                : 'bg-blue-100 dark:bg-gray-900	p-3 rounded'
                            } `}
                          >
                            {permission?.perm_title}
                          </h3>
                          <div className="px-4">
                            {permission?.children?.length === 0 &&
                            Array.isArray(permission?.options) &&
                            permission?.options.length > 0 ? (
                              <ul className="flex items-center">
                                {permission?.options?.map((option: any) => (
                                  <li key={option.label} className="flex items-center gap-x-2 px-3">
                                    <input
                                      type="checkbox"
                                      {...register(option.label)}
                                      name={option.label}
                                      id={`${permission.id}-${option.label}`}
                                      className="cursor-pointer"
                                      checked={option.value}
                                      onChange={(e) =>
                                        handleSelectPermission(e, permission?.id, option)
                                      }
                                    />
                                    <label
                                      htmlFor={`${permission.id}-${option.label}`}
                                      className="cursor-pointer"
                                    >
                                      {option.label || ''}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                        <ul className="grid lg:grid-cols-1 gap-x-2 my-2 ">
                          <>
                            {Array.isArray(permission?.children) ? (
                              permission?.children.map((childPermission: any) => (
                                <div
                                  key={childPermission?.id}
                                  className={` ${
                                    childPermission?.children?.length === 0
                                      ? 'flex items-center justify-between'
                                      : 'border dark:border-gray-500 rounded-lg my-4 relative'
                                  } `}
                                >
                                  <div
                                    className={` ${
                                      childPermission?.children?.length === 0
                                        ? 'px-2'
                                        : 'absolute -top-3 left-3 bg-white dark:bg-[#1f2937] px-2 border border-gray-300  rounded'
                                    } `}
                                  >
                                    {childPermission?.perm_title || 'Parent'}
                                  </div>
                                  <div
                                    className={` ${
                                      childPermission?.children?.length === 0
                                        ? 'hidden'
                                        : 'absolute -top-3 right-12 bg-white dark:bg-[#1f2937] px-2 border border-gray-300 rounded'
                                    } `}
                                  >
                                    {Array.isArray(childPermission?.options) &&
                                    childPermission?.options.length > 0 ? (
                                      <ul className="flex items-center">
                                        {childPermission?.options.map(
                                          (f_option: any, index: any) => (
                                            <li
                                              key={index}
                                              className="px-3 flex items-center gap-2"
                                            >
                                              <input
                                                type="checkbox"
                                                {...register(f_option.label)}
                                                name={f_option.label}
                                                id={`${childPermission.id}-${f_option.label}`}
                                                className="cursor-pointer"
                                                checked={f_option.value}
                                                onChange={(e) =>
                                                  handleSelectAll(e, childPermission?.id)
                                                }
                                              />
                                              <label
                                                htmlFor={`${childPermission.id}-${f_option.label}`}
                                                className="cursor-pointer"
                                              >
                                                {f_option.label || ''}
                                              </label>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    ) : (
                                      ''
                                    )}
                                  </div>
                                  <div className="p-4">
                                    {childPermission?.children?.length === 0 &&
                                    Array.isArray(childPermission?.options) &&
                                    childPermission?.options.length > 0 ? (
                                      <ul className="flex items-center">
                                        {childPermission?.options.map(
                                          (f_option_2: any, index: any) => (
                                            <li
                                              key={index}
                                              className="flex items-center gap-2 px-3"
                                            >
                                              <label className="cursor-pointer flex items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  {...register(f_option_2.label)}
                                                  name={f_option_2.label}
                                                  id={`${childPermission.id}-${f_option_2.label}`}
                                                  checked={f_option_2.value}
                                                  className="cursor-pointer"
                                                  onChange={(e) =>
                                                    handleSelectPermission(
                                                      e,
                                                      childPermission?.id,
                                                      f_option_2,
                                                    )
                                                  }
                                                />
                                                {f_option_2.label || ''}
                                              </label>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    ) : (
                                      ''
                                    )}
                                  </div>

                                  {childPermission?.children.length > 0 && (
                                    <ul className="pl-6">
                                      {Array.isArray(childPermission?.children) &&
                                      childPermission?.children.length > 0
                                        ? childPermission?.children.map(
                                            (secondChildPermission: any) => (
                                              <li
                                                key={secondChildPermission?.id}
                                                className="flex items-center justify-between gap-2 border-b dark:border-gray-500 pb-2 mb-2 last:border-none"
                                              >
                                                <div className="text-sm text-blue-800 dark:text-white">
                                                  {secondChildPermission?.perm_title || ''}
                                                </div>
                                                <ul className="flex items-center pr-4">
                                                  {Array.isArray(secondChildPermission?.options) &&
                                                  secondChildPermission?.options.length > 0
                                                    ? secondChildPermission?.options.map(
                                                        (s_option: any) => (
                                                          <li
                                                            key={s_option.label}
                                                            className="flex items-center gap-2 px-3 "
                                                          >
                                                            <input
                                                              type="checkbox"
                                                              {...register(s_option.label)}
                                                              name={s_option.label}
                                                              id={`${secondChildPermission.id}-${s_option.label}`}
                                                              className="cursor-pointer"
                                                              checked={s_option.value}
                                                              onChange={(e) =>
                                                                handleSelectPermission(
                                                                  e,
                                                                  secondChildPermission?.id,
                                                                  s_option,
                                                                )
                                                              }
                                                            />
                                                            <label
                                                              htmlFor={`${secondChildPermission.id}-${s_option.label}`}
                                                              className="cursor-pointer"
                                                            >
                                                              {s_option.label || ''}
                                                            </label>
                                                          </li>
                                                        ),
                                                      )
                                                    : ''}
                                                </ul>
                                              </li>
                                            ),
                                          )
                                        : ''}
                                    </ul>
                                  )}
                                </div>
                              ))
                            ) : (
                              <li>{t('common.not_data_found')}</li>
                            )}
                          </>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 rounded-lg shadow w-full bg-white dark:bg-[#1f2937] p-4">
            <SubmitButton
              UpdateData={data}
              disabled={!availableFor}
              IsLoading={isPending}
              AddLabel={t('button.add_role')}
              UpdateLabel={t('button.update_role')}
            />
          </div>
        </div>
      </form>
      {/* )} */}
    </div>
  );
};

export default UpdateRoleForm;
