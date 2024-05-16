import { useNavigation } from '@remix-run/react';
import { NavigationStates } from '@remix-run/router';
import React from 'react';

export function PLSpinner() {
  const { state } = useNavigation()
  return (
    <div className={"rounded-full h-7 w-7 border-t-2 border-b-2 dark:border-green-400 border-green-400" + (state === 'loading' ? ' animate-spin' : ' hidden')} ></div>
  );
};