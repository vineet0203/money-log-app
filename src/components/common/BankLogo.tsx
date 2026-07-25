import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface BankLogoProps {
  institutionName?: string | null;
  logoBase64?: string | null;
  logoUrl?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

// ----------------------------------------------------------------------
// 🏦 BANK LOGO MAPPING
// ----------------------------------------------------------------------
// Here you can map specific bank names to local assets, remote URLs, or SVGs.
// Example usage:
// 'chase': require('../../../assets/banks/chase.png'),
// 'bank of america': 'https://example.com/boa-logo.png',
// ----------------------------------------------------------------------
const CUSTOM_BANK_LOGOS: Record<string, any> = {
  'chase': require('../../../assets/international-bank/chase.svg'),
  'bank of america': require('../../../assets/international-bank/boa.svg'),
  'bofa': require('../../../assets/international-bank/boa.svg'),
  'wells fargo': require('../../../assets/international-bank/wells.svg'),
  'citi': require('../../../assets/international-bank/citi.svg'),
  'american express': require('../../../assets/international-bank/american-express.svg'),
  'amex': require('../../../assets/international-bank/american-express.svg'),
  'td': require('../../../assets/international-bank/td.svg'),
  'hsbc': require('../../../assets/international-bank/hsbc.svg'),
  'barclays': require('../../../assets/international-bank/barclays.svg'),
  'ubs': require('../../../assets/international-bank/ubs.svg'),
  'credit suisse': require('../../../assets/international-bank/credit-suisse.svg'),
  'deutsche': require('../../../assets/international-bank/deutsche.svg'),
  'bnp': require('../../../assets/international-bank/bnp.svg'),
  'societe generale': require('../../../assets/international-bank/societe-generale.svg'),
  'rbc': require('../../../assets/international-bank/rbc.svg'),
  'scotia': require('../../../assets/international-bank/scotia.svg'),
  'anz': require('../../../assets/international-bank/anz.svg'),
  'commonwealth': require('../../../assets/international-bank/commonwealth.svg'),
  'westpac': require('../../../assets/international-bank/westpac.svg'),
  'nab': require('../../../assets/international-bank/nab.svg'),
  'dbs': require('../../../assets/international-bank/dbs.svg'),
  'ocbc': require('../../../assets/international-bank/ocbc.svg'),
  'uob': require('../../../assets/international-bank/uob.svg'),
  'smbc': require('../../../assets/international-bank/smbc.svg'),
  'mizuho': require('../../../assets/international-bank/mizuho.svg'),
  'mufg': require('../../../assets/international-bank/mufg.svg'),
  'icbc': require('../../../assets/international-bank/icbc.svg'),
  'boc': require('../../../assets/international-bank/boc.svg'),
  'standard': require('../../../assets/international-bank/standard.svg'),
  'rabobank': require('../../../assets/international-bank/rabobank.svg'),
  'natwest': require('../../../assets/international-bank/natwest.svg'),
};

export default function BankLogo({
  institutionName,
  logoBase64,
  logoUrl,
  color,
  size = 48,
  className = '',
  fallbackIcon = 'wallet',
}: BankLogoProps) {
  
  // 1. Check if we have a custom mapped logo for this institution
  let customLogoSource: any = null;
  if (institutionName) {
    const normalizedName = institutionName.toLowerCase().trim();
    // Try exact match or partial match for top banks
    for (const [key, source] of Object.entries(CUSTOM_BANK_LOGOS)) {
      if (normalizedName.includes(key)) {
        customLogoSource = source;
        break;
      }
    }
  }

  const containerStyle = {
    width: size,
    height: size,
    backgroundColor: 'transparent',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
  };

  // -------------------------
  // RENDER: CUSTOM LOGO (Mapped Asset)
  // -------------------------
  if (customLogoSource) {
    return (
      <View className={`items-center justify-center ${className}`} style={containerStyle}>
        <Image 
          source={customLogoSource} 
          style={imageStyle as any}
          contentFit="contain"
        />
      </View>
    );
  }

  // -------------------------
  // RENDER: URL LOGO (e.g. from transaction merchant)
  // -------------------------
  if (logoUrl) {
    return (
      <View className={`items-center justify-center ${className}`} style={containerStyle}>
        <Image 
          source={{ uri: logoUrl }} 
          style={{ width: size, height: size } as any}
          contentFit="contain"
        />
      </View>
    );
  }

  // -------------------------
  // RENDER: DEFAULT BANK SVG FALLBACK
  // -------------------------
  const defaultBankIcon = require('../../../assets/international-bank/default-bank.svg');
  return (
    <View className={`items-center justify-center ${className}`} style={containerStyle}>
      <Image 
        source={defaultBankIcon} 
        style={{ width: size, height: size } as any}
        contentFit="contain"
      />
    </View>
  );
}
