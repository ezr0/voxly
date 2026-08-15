import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5B4CF0',
        tabBarInactiveTintColor: '#96A0B5',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 84,
          paddingBottom: 12,
          paddingTop: 12,
        },
        headerStyle: {
          backgroundColor: '#F5F7FF',
        },
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'sparkles',
                android: 'manage_search',
                web: 'search',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'books.vertical',
                android: 'library_books',
                web: 'book',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'person.crop.circle',
                android: 'person',
                web: 'person',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
