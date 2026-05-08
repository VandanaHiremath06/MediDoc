import { useState } from 'react';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';

export default function TestBackendButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState('');

  const testBackend = async () => {
    setTesting(true);
    setResult('Testing...');

    try {
      // Test health endpoint
      const healthResponse = await fetch(`${API_BASE}/health`, {
        headers: getAuthHeaders(),
      });
      const healthData = await healthResponse.json();

      if (healthData.status === 'ok') {
        setResult('✅ Backend is connected and working!');
      } else {
        setResult('⚠️ Backend responded but status not ok');
      }
    } catch (err: any) {
      setResult(`❌ Backend error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={testBackend}
        disabled={testing}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg hover:bg-gray-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Backend'}
      </button>
      {result && (
        <div className="mt-2 bg-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs">
          {result}
        </div>
      )}
    </div>
  );
}
