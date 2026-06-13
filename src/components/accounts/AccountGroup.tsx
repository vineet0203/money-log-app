import { View, Text } from 'react-native';
import AccountCard from '../cards/AccountCard';

type Account = {
  id: string;
  name: string;
  bank: string;
  amount: string;
  icon: string;
  color: string;
  bg?: string;
  isNegative?: boolean;
};

type AccountGroupProps = {
  title: string;
  accounts: Account[];
};

export default function AccountGroup({ title, accounts }: AccountGroupProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-extrabold text-text mb-3 px-2">{title}</Text>
      
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </View>
  );
}
