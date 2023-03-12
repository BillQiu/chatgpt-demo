import {
  LOCAL_STORAGE_PROMPT_CURRENT,
  LOCAL_STORAGE_PROMPT_INFO,
  LOCAL_STORAGE_PROMPT_KEY,
} from "./constant";

interface PromptInfo {
  name?: string;
  content: string;
}

export const getPromptKeys: () => string[] = () => {
  const keys = localStorage.getItem(LOCAL_STORAGE_PROMPT_KEY);
  if (keys) return JSON.parse(keys);

  return [];
};

export const addPromptKey = (key: string) => {
  const keys = getPromptKeys();
  if (keys.includes(key)) return;

  localStorage.setItem(
    LOCAL_STORAGE_PROMPT_KEY,
    JSON.stringify([...keys, key])
  );
};

export const deletePromptKey: (K: string) => string[] = (key) => {
  const keys = getPromptKeys();
  if (!keys.includes(key)) return;

  const result = keys.filter((k) => k !== key);

  localStorage.setItem(LOCAL_STORAGE_PROMPT_KEY, JSON.stringify(result));

  return result;
};

export const getPromptInfo: () => Record<string, PromptInfo> = () => {
  const info = localStorage.getItem(LOCAL_STORAGE_PROMPT_INFO);
  if (info) return JSON.parse(info);

  return {};
};

export const getPromptInfoByKey: (T: string) => PromptInfo = (key) => {
  const info = getPromptInfo();
  return info[key];
};

export const setPromptInfo = (key: string, value: PromptInfo) => {
  const info = getPromptInfo();
  localStorage.setItem(
    LOCAL_STORAGE_PROMPT_INFO,
    JSON.stringify({ ...info, [key]: value })
  );
};

const deletePromptInoByKey: (T: string) => Record<string, PromptInfo> = (
  key
) => {
  const info = getPromptInfo();
  delete info[key];

  localStorage.setItem(LOCAL_STORAGE_PROMPT_INFO, JSON.stringify(info));

  return info;
};

export const removeLocalStoragePrompt: (
  K: string
) => [Array<string>, Record<string, PromptInfo>] = (key: string) => {
  const keys = deletePromptKey(key);
  const info = deletePromptInoByKey(key);

  return [keys, info];
};

export const updatePromptInfo = (id: string, key: string, value: any) => {
  const info = getPromptInfoByKey(id);
  if (!info) return;

  setPromptInfo(id, { ...info, [key]: value });
};

export const setCurrentLocalId = (id: string) => {
  localStorage.setItem(LOCAL_STORAGE_PROMPT_CURRENT, id);
};
export const getCurrentLocalId: () => string = () => {
  return localStorage.getItem(LOCAL_STORAGE_PROMPT_CURRENT) ?? "";
};
