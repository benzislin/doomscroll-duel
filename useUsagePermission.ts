import {useEffect, useState} from 'react';
import {AppState, NativeModules} from 'react-native';

export function useUsagePermission() {
  const [granted, setGranted] = useState(true);
  useEffect(() => {
    const check = async () => {
      try {
        setGranted(await NativeModules.UsageStats.hasPermission());
      } catch (e) {
        console.error(e);
      }
    };
    check();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        check();
      }
    });
    return () => sub.remove();
  }, []);
  return granted;
}