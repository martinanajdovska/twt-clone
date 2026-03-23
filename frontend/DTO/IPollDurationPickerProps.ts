export interface IPollDurationPickerProps {
  minutes: number;
  hours: number;
  days: number;
  onMinutesChange: (minutes: number) => void;
  onHoursChange: (hours: number) => void;
  onDaysChange: (days: number) => void;
}
