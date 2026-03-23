import { useState, useMemo, useCallback } from "react";

const MAX_POLL_OPTIONS = 4;
const MIN_POLL_OPTIONS = 2;

export const usePoll = () => {
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDurationMinutes, setPollDurationMinutes] = useState(0);
  const [pollDurationHours, setPollDurationHours] = useState(0);
  const [pollDurationDays, setPollDurationDays] = useState(1);

  const togglePoll = useCallback(() => {
    setShowPoll((p) => !p);
  }, []);

  const updateOption = useCallback((index: number, value: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }, []);

  const addOption = useCallback(() => {
    setPollOptions((prev) =>
      prev.length < MAX_POLL_OPTIONS ? [...prev, ""] : prev,
    );
  }, []);

  const removeOption = useCallback((index: number) => {
    setPollOptions((prev) =>
      prev.length > MIN_POLL_OPTIONS
        ? prev.filter((_, i) => i !== index)
        : prev,
    );
  }, []);

  const resetPoll = useCallback(() => {
    setShowPoll(false);
    setPollOptions(["", ""]);
    setPollDurationMinutes(0);
    setPollDurationHours(0);
    setPollDurationDays(1);
  }, []);

  const pollValid = useMemo(() => {
    if (!showPoll) return true;
    return (
      pollOptions.filter((o) => o.trim().length > 0).length >= MIN_POLL_OPTIONS
    );
  }, [showPoll, pollOptions]);

  return {
    showPoll,
    pollOptions,
    pollDurationMinutes,
    pollDurationHours,
    pollDurationDays,

    setPollDurationMinutes,
    setPollDurationHours,
    setPollDurationDays,

    togglePoll,
    updateOption,
    addOption,
    removeOption,
    resetPoll,

    pollValid,
    MAX_POLL_OPTIONS,
    MIN_POLL_OPTIONS,
  };
};
