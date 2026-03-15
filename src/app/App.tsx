import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');

    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(162 47% 50%)',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
}
