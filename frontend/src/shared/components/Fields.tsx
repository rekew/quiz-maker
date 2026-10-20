import { useId } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

interface BaseFieldProps {
  label: string;
  hint?: ReactNode;
}

interface TextFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export function TextField({ label, hint, id, className = "", ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label className="field" htmlFor={inputId}>
      {label}
      <input id={inputId} className={className} {...props} />
      {hint && <span className="muted small">{hint}</span>}
    </label>
  );
}

interface TextAreaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextAreaField({ label, hint, id, className = "", ...props }: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label className="field" htmlFor={inputId}>
      {label}
      <textarea id={inputId} className={className} {...props} />
      {hint && <span className="muted small">{hint}</span>}
    </label>
  );
}

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function SelectField({ label, hint, id, className = "", children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label className="field" htmlFor={inputId}>
      {label}
      <select id={inputId} className={className} {...props}>
        {children}
      </select>
      {hint && <span className="muted small">{hint}</span>}
    </label>
  );
}
