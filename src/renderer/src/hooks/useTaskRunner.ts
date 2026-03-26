import { useState } from 'react';
import { getMessage, type Locale, type TranslateFn, type TranslationValues } from '../i18n';

export type RunTask = (key: string, task: () => Promise<void>, values?: TranslationValues) => Promise<void>;

interface UseTaskRunnerOptions {
  locale: Locale;
  t: TranslateFn;
}

export function useTaskRunner({ locale, t }: UseTaskRunnerOptions) {
  const [busy, setBusy] = useState<string | null>(null);
  const [activity, setActivity] = useState(() => getMessage(locale, 'activity.bootstrapping'));

  async function runTask(key: string, task: () => Promise<void>, values?: TranslationValues) {
    const label = t(key, values);
    setBusy(label);
    setActivity(t('activity.running', { label }));

    try {
      await task();
      setActivity(t('activity.completed', { label }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknownError');
      setActivity(t('activity.failed', { label, message }));
    } finally {
      setBusy(null);
    }
  }

  return {
    busy,
    activity,
    setActivity,
    runTask
  };
}
