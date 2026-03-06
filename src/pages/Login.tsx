import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Cronos Expense</CardTitle>
          <p className="text-sm text-muted-foreground">Accedi per gestire le tue note spese</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Accedi',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Registrati',
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;