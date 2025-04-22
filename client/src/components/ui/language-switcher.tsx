import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Check } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  const languages = [
    { code: 'en', name: t('languages.en') },
    { code: 'zh-TW', name: t('languages.zh-TW') },
    { code: 'zh-CN', name: t('languages.zh-CN') },
    { code: 'ja', name: t('languages.ja') }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <DropdownMenuLabel>{t('settings.language')}</DropdownMenuLabel>
      {languages.map((lang) => (
        <DropdownMenuItem
          key={lang.code}
          className="flex items-center justify-between cursor-pointer"
          onClick={() => changeLanguage(lang.code)}
        >
          <span>{lang.name}</span>
          {currentLanguage === lang.code && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}