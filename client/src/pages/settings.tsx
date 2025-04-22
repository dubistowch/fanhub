import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const SettingsPage = () => {
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
            <CardDescription>
              {t('settings.languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="language">{t('settings.selectLanguage')}</Label>
              <Select value={currentLanguage} onValueChange={changeLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('settings.selectLanguagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center justify-between w-full">
                        <span>{lang.name}</span>
                        {currentLanguage === lang.code && (
                          <Check className="h-4 w-4 ml-2 text-primary" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;