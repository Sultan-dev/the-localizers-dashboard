import axios, { AxiosError } from "axios";
import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
// import type { Selection, SelectionMode } from "@heroui/react";
type Selection = any;
type SelectionMode = any;
import apiConfig from "../config/api";

// Base URLs
// Remove trailing slash
let baseUrlValue = apiConfig.baseURL.trim();
if (baseUrlValue.endsWith("/")) {
  baseUrlValue = baseUrlValue.slice(0, -1);
}
// If baseURL doesn't end with /api, add it
if (!baseUrlValue.endsWith("/api")) {
  baseUrlValue = baseUrlValue + "/api";
}
export const baseUrl = baseUrlValue + "/";
export const fileURL = baseUrlValue.replace("/api", "/storage") + "/";
export const websiteFileURL = baseUrlValue.replace("/api", "") + "/";

// Base URL for v3 website APIs
export const websiteBaseUrl = baseUrlValue.replace("/api", "/api/v3") + "/";

export const getWebsiteApiUrl = (path: string) => {
  return `${websiteBaseUrl}website/${path}`;
};

// Hook for fetching website admin APIs (uses v3 instead of v1)
export const useFetchWebsite = <T>(
  path: string,
  key: string,
  enabled?: boolean
) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [isEnabled] = useState(enabled === undefined ? true : enabled);

  const fetchData = async (): Promise<T> => {
    // Use v3 base URL for website APIs
    const fullPath = `admin/website/${path}`;
    const response = await axios.get<T>(`${websiteBaseUrl}${fullPath}`, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
        Accept: "application/json",
        "Content-Type": "application/json, application/pdf",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data;
  };

  const query = useQuery<T, AxiosError>({
    queryKey: [key],
    queryFn: fetchData,
    enabled: isEnabled,
  });

  useEffect(() => {
    if (query.error) {
      const err = query.error as AxiosError;
      const status = err.response?.status;
      if (status === 401) {
        removeCookie("token");
        navigate("/login");
      } else if (status === 403) {
        navigate("/403");
      } else if (status === 500) {
        navigate("/error500");
      }
    }
  }, [query.error, removeCookie, navigate]);

  return query;
};

export const useFetch = <T>(url: string, key: string, enabled?: boolean) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [isEnabled] = useState(enabled === undefined ? true : enabled);

  // Check if URL is valid (not empty)
  const isValidUrl = Boolean(url && url.trim().length > 0);
  const shouldFetch = isEnabled && isValidUrl;

  const fetchData = async (): Promise<T> => {
    if (!isValidUrl) {
      throw new Error("URL is empty");
    }
    const response = await axios.get<T>(`${baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
        Accept: "application/json",
        "Content-Type": "application/json, application/pdf",
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data;
  };

  const query = useQuery<T, AxiosError>({
    queryKey: [key],
    queryFn: fetchData,
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (query.error) {
      const err = query.error as AxiosError;
      const status = err.response?.status;
      if (status === 401) {
        removeCookie("token");
        navigate("/login");
      } else if (status === 403) {
        navigate("/403");
      } else if (status === 500) {
        navigate("/error500");
      }
    }
  }, [query.error, removeCookie, navigate]);

  return query;
};

interface InputFile {
  name: string;
  value: string;
  type: string;
}

export type FilesState = Record<string, File>;

type CheckedArray = Record<string, string[]>;

export interface SelectedOption {
  value: string | number;
  label: string;
}

export interface ArrayObject {
  id: any;
  value: any;
  deleted?: boolean;
  uploaded?: boolean;
}

export interface HandleChangeSelectionProps {
  keys: Selection;
  name: string;
  selectionMode?: SelectionMode;
}

export const usePOST = <FormDataType extends Record<string, any>>(
  initialData: FormDataType,
  actionSuccess: (data: any) => void,
  actionError: (error: any) => void
) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormDataType>(initialData);
  const [images, setImages] = useState<FilesState>({});
  const [viewfile, setViewFile] = useState<string>();
  const [viewFiles, setViewFiles] = useState<InputFile[]>([]);
  const [checkedArray, setCheckedArray] = useState<CheckedArray>({});

  const prepareFormData = useCallback(
    (data?: FormDataType) => {
      const dataToProcess = data || formData;

      // Check if there are any files in the data or images state
      let hasFiles = Object.keys(images).length > 0;

      // Also check if data contains any File or Blob objects
      if (!hasFiles) {
        for (const value of Object.values(dataToProcess)) {
          if (value instanceof File || value instanceof Blob) {
            hasFiles = true;
            break;
          }
        }
      }

      // If there are no files, return JSON data
      if (!hasFiles) {
        const jsonData: any = {};

        for (const [key, value] of Object.entries(dataToProcess)) {
          if (value === null || value === undefined) continue;

          // Skip File and Blob objects when sending JSON
          if (value instanceof File || value instanceof Blob) {
            continue;
          }

          jsonData[key] = value;
        }

        if (checkedArray) {
          for (const [key, value] of Object.entries(checkedArray)) {
            jsonData[key] = value;
          }
        }

        return jsonData;
      }

      // If there are files, use FormData
      const formDataToSend = new FormData();

      for (const [key, value] of Object.entries(dataToProcess)) {
        if (value === null || value === undefined) continue;

        // Handle arrays (like curriculum_ids: [1, 2, 3])
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            formDataToSend.append(`${key}[]`, String(value[i]));
          }
        }
        // Handle nested objects (like seo: { title: "...", description: "..." })
        else if (
          typeof value === "object" &&
          !(value instanceof File) &&
          !(value instanceof Blob)
        ) {
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            if (nestedValue !== null && nestedValue !== undefined) {
              formDataToSend.append(
                `${key}[${nestedKey}]`,
                nestedValue as string | Blob
              );
            }
          }
        } else {
          formDataToSend.append(key, value as string | Blob);
        }
      }

      if (checkedArray) {
        for (const [key, value] of Object.entries(checkedArray)) {
          for (let i = 0; i < value.length; i++) {
            formDataToSend.append(key, value[i]);
          }
        }
      }

      if (images) {
        for (const [key, value] of Object.entries(images)) {
          formDataToSend.append(`images[${key}]`, value);
        }
      }

      return formDataToSend;
    },
    [formData, checkedArray, images]
  );

  const mutation = useMutation({
    mutationFn: async ({
      url,
      data,
      method = "POST",
    }: {
      url: string;
      data?: FormDataType;
      method?: "POST" | "PUT" | "PATCH";
    }) => {
      const dataToSend = prepareFormData(data);

      // Check if dataToSend is FormData or plain object (JSON)
      const isFormData = dataToSend instanceof FormData;

      const methodToUse =
        method === "PUT"
          ? axios.put
          : method === "PATCH"
          ? axios.patch
          : axios.post;

      // Use v3 base URL for website APIs, otherwise use v1
      const apiBaseUrl = url.startsWith("admin/website/")
        ? websiteBaseUrl
        : baseUrl;

      // Set headers based on whether we're sending JSON or FormData
      const headers: any = {
        Authorization: `Bearer ${cookies.token}`,
        Accept: "application/json",
      };

      // Only set Content-Type for JSON (FormData will set it automatically with boundary)
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const res = await methodToUse(`${apiBaseUrl}${url}`, dataToSend, {
        headers,
      });

      return res;
    },
    onSuccess: (data) => {
      actionSuccess(data);
    },
    onError: (error) => {
      actionError(error);
      mutation.reset();
      const err = error as AxiosError;
      const status = err.response?.status;
      if (status === 401) {
        removeCookie("token");
        navigate("/login");
      } else if (status === 403) {
        navigate("/403");
      } else if (status === 500) {
        navigate("/error500");
      }
    },
  });

  const prepareArrayOfObjects = (
    arrayOfarrayObject: ArrayObject[][],
    name: string[]
  ) => {
    let newFormData = formData;

    arrayOfarrayObject.forEach((arrayObject, arrIndex) => {
      arrayObject
        .filter((ob) => ob.uploaded && !ob.deleted)
        .forEach(
          (ob, index) =>
            (newFormData = {
              ...newFormData,
              [`${name[arrIndex]}[${index}]`]: ob.value,
            })
        );

      arrayObject
        .filter((ob) => ob.deleted && !ob.uploaded)
        .forEach(
          (ob, index) =>
            (newFormData = {
              ...newFormData,
              [`old_images_to_delete[${index}]`]: ob.id,
            })
        );
    });

    return newFormData;
  };

  const handleSubmit = (
    url: string,
    data?: FormDataType,
    method: "POST" | "PUT" | "PATCH" = "POST"
  ) => {
    mutation.mutate({ url, data, method });
  };

  const handleChangeSelect = (
    selected: SelectedOption | SelectedOption[],
    active: { name: string }
  ) => {
    setFormData((prev) => ({
      ...prev,
      ["option_" + active.name]: selected,
      [active.name]: Array.isArray(selected)
        ? selected.map((e) => e.value)
        : selected.value,
    }));
  };

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files, checked } = event.target;

    let currentValue: string | File | boolean | undefined | 1 | 0;

    if (type === "file") {
      let file = (currentValue = files ? files[0] : undefined);

      const showfile = URL.createObjectURL(file as Blob | MediaSource);

      setViewFile(showfile);

      event.target.value = "";
    } else if (type === "checkbox") {
      currentValue = checked ? 1 : 0;
    } else {
      currentValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: currentValue }));
  };

  const handleChangeSelection = (
    keys: Selection,
    name: string,
    selectionMode?: SelectionMode
  ) => {
    const selectionKeys = Array.from(keys);
    if (
      selectionMode === "single" ||
      selectionMode === "none" ||
      !selectionMode
    )
      setFormData((prev) => ({ ...prev, [name]: selectionKeys[0] }));
    else {
      selectionKeys.map((selection, index) => {
        setFormData((prev) => ({ ...prev, [`${name}[${index}]`]: selection }));
      });
    }
  };

  const prepareArray = (array: any[], name: string, data: any) => {
    let newData = {};

    array.map((item, index) => {
      newData = { ...newData, [`${name}[${index}]`]: item };
    });

    return { ...newData, ...data };
  };

  const handleChangeTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeArrayFiles = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    const newFilesObject: FilesState = {};

    if (files) {
      const currentImagesCount = Object.keys(images).length;

      for (let i = 0; i < files.length; i++) {
        newFilesObject[`${currentImagesCount + i}`] = files[i];
      }

      setImages((prevImages) => ({
        ...prevImages,
        ...newFilesObject,
      }));

      const urlImages: InputFile[] = [];

      for (let i = 0; i < files.length; i++) {
        if (!files[i]) continue;

        urlImages.push({
          name: files[i].name,
          value: URL.createObjectURL(files[i]),
          type: files[i].type,
        });
      }

      setViewFiles((prev) => [...prev, ...urlImages]);

      event.target.value = "";
    }
  };

  const handleCheckedArray = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked, name } = e.target;

    if (checked) {
      setCheckedArray((prev) => ({
        ...prev,
        [name]: prev[name] ? [...prev[name], value] : [value],
      }));
    } else {
      setCheckedArray((prev) => ({
        ...prev,
        [name]: prev[name].filter((p) => p !== value),
      }));
    }
  };

  return {
    handleSubmit,
    formData,
    setFormData,
    handleChangeInput,
    handleChangeTextArea,
    handleChangeArrayFiles,
    images,
    viewFiles,
    viewfile,
    setImages,
    handleCheckedArray,
    handleChangeSelect,
    mutation,
    setViewFile,
    prepareArrayOfObjects,
    handleChangeSelection,
    prepareArray,
  };
};

export const useDelete = (
  actionSuccess: (data?: any) => void,
  actionError: (data?: any) => void
) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (url: string) => {
      // Use v3 base URL for website APIs, otherwise use v1
      const apiBaseUrl = url.startsWith("admin/website/")
        ? websiteBaseUrl
        : baseUrl;

      return axios
        .delete(apiBaseUrl + url, {
          headers: {
            Authorization: "Bearer " + cookies.token,
            Accept: "application/json",
          },
        })
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      actionSuccess(data);
    },
    onError: (error) => {
      actionError(error);
      const err = error as AxiosError;
      const status = err.response?.status;
      if (status === 401) {
        removeCookie("token");
        navigate("/login");
      } else if (status === 403) {
        navigate("/403");
      } else if (status === 500) {
        navigate("/error500");
      }
    },
  });

  const deleteItem = (url: string) => {
    mutation.mutate(url);
  };

  return { deleteItem, mutation };
};

export const useFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams.toString());

  const handleParamsClick = (
    name: string,
    value: string | string[] | number
  ) => {
    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.set(name, value.join(","));
      else searchParams.delete(name);
    } else if (value) {
      newSearchParams.set(name, value.toString());
      setSearchParams(newSearchParams);
    }
  };

  const handleParamDelete = (name: string) => {
    newSearchParams.delete(name);
    setSearchParams(newSearchParams);
  };

  const handleParamsDeleteAll = () => {
    searchParams.forEach((key) => newSearchParams.delete(key));
    setSearchParams(newSearchParams);
  };

  const handlePageClick = (page: number) => {
    handleParamsClick("page", page);
  };

  return {
    searchParams,
    handlePageClick,
    handleParamsClick,
    handleParamDelete,
    handleParamsDeleteAll,
  };
};

const logoutRequest = async (url: string, token: string): Promise<void> => {
  await axios.post(
    `${baseUrl}${url}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const useLogout = (actionError: () => void) => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(["token"]);

  const mutation = useMutation<void, Error, string>({
    mutationFn: (url) => logoutRequest(url, cookies.token),
    onSuccess: () => {
      removeCookie("token");
      navigate("/login");
      window.location.reload();
    },
    onError: (_error) => {
      actionError();
    },
  });

  return mutation;
};

interface UseCloseReturnType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mouse: React.RefObject<HTMLDivElement>;
}

export const useClose = (): UseCloseReturnType => {
  const [open, setOpen] = useState<boolean>(false);
  const mouse = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (mouse.current && !mouse.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return { open, setOpen, mouse };
};

export const RequireAuth: React.FC<{
  children: ReactElement<any, any> | null;
}> = ({ children }) => {
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.token) {
      navigate("/login");
    }
  }, [cookies.token, navigate]);

  return children;
};

export const clickZoomInImage = (event: React.MouseEvent<HTMLImageElement>) => {
  event.preventDefault();

  const target = event.target as HTMLImageElement;

  if (target.requestFullscreen) {
    target.requestFullscreen();
  }
};
