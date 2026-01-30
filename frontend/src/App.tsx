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
    // Check for demo session first
    const demoSession = localStorage.getItem('swasth_demo_session');
    if (demoSession) {
      setSession(JSON.parse(demoSession));
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!demoSession) {
        setSession(data?.session || null);
        setLoading(false);
      }
    });

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        localStorage.removeItem('swasth_demo_session');
      } else if (session) {
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
