import { MantineProvider, Loader, Center } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/Auth';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else {
        setSession(session);
      }
    });

    return () => {
      if (subscriptionData?.subscription) {
        subscriptionData.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Center h="100vh">
          <div style={{ margin: 'auto' }}><Loader size="xl" color="deep-violet" variant="bars" /></div>
        </Center>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      {session ? <Dashboard /> : <AuthPage />}
    </MantineProvider>
  );
}
