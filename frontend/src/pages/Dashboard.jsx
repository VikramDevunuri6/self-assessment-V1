import { useEffect } from 'react';
import { getProfile } from '../services/authService';

export default function Dashboard() {
  useEffect(() => {
    async function test() {
      try {
        const data = await getProfile();
        console.log('DATA:', data);
      } catch (err) {
        console.error('ERROR:', err);
      }
    }

    test();
  }, []);

  return <h1>Dashboard</h1>;
}