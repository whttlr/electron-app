import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  style,
  size = 'middle',
  showIcon = true
}) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Space style={style}>
      {showIcon && <GlobalOutlined />}
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        size={size}
        style={{ minWidth: 120 }}
        placeholder="Language"
      >
        {languages.map(language => (
          <Option key={language.code} value={language.code}>
            <Space>
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default LanguageSwitcher;