"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface FrequencyPickerProps {
  frequency: string;
  frequencyValue: number | null;
  targetDays: string[] | null;
  onFrequencyChange: (frequency: string) => void;
  onFrequencyValueChange: (value: number | null) => void;
  onTargetDaysChange: (days: string[] | null) => void;
}

export function FrequencyPicker({
  frequency,
  frequencyValue,
  targetDays,
  onFrequencyChange,
  onFrequencyValueChange,
  onTargetDaysChange,
}: FrequencyPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Frequency</Label>
        <Select value={frequency} onValueChange={onFrequencyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="every_n_days">Every N days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frequency === "every_n_days" && (
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Every how many days?</Label>
          <Input
            type="number"
            min={2}
            max={365}
            value={frequencyValue ?? 2}
            onChange={(e) => onFrequencyValueChange(parseInt(e.target.value) || 2)}
          />
        </div>
      )}

      {frequency === "weekly" && (
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Target days</Label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <label key={day} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={targetDays?.includes(day) ?? false}
                  onCheckedChange={(checked) => {
                    const current = targetDays ?? [];
                    if (checked) {
                      onTargetDaysChange([...current, day]);
                    } else {
                      onTargetDaysChange(current.filter((d) => d !== day));
                    }
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {frequency === "monthly" && (
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Day of month</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={frequencyValue ?? 1}
            onChange={(e) => onFrequencyValueChange(parseInt(e.target.value) || 1)}
          />
        </div>
      )}
    </div>
  );
}
