import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BaseFieldProps {
  label: string;
  hint?: ReactNode;
}

interface TextFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export function TextField({ label, hint, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} className={className} {...props} />
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

interface TextAreaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextAreaField({ label, hint, id, className, ...props }: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Textarea id={inputId} className={className} {...props} />
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  hint,
  value,
  onValueChange,
  options,
  disabled,
  className,
}: SelectFieldProps) {
  const inputId = useId();
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={inputId} className={className ?? "w-full"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
