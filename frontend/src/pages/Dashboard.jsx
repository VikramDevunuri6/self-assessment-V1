import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      console.log('DATA:', data);
      console.log('ERROR:', error);
    }

    test();
  }, []);

  return <h1>Dashboard</h1>;
}