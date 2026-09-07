import type { ReactNode } from "react"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field"

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Field orientation="horizontal" className="parle-setting">
      <FieldContent>
        <FieldTitle className="parle-setting-title">{title}</FieldTitle>
        {description ? (
          <FieldDescription className="parle-setting-description">
            {description}
          </FieldDescription>
        ) : null}
      </FieldContent>
      {children}
    </Field>
  )
}

export function SettingSection({ children }: { children: ReactNode }) {
  return (
    <section>
      <FieldGroup className="gap-0">{children}</FieldGroup>
    </section>
  )
}

export function ParleSwitch({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="parle-switch"
      data-checked={checked ? "" : undefined}
      onClick={() => {
        if (!disabled) {
          onCheckedChange(!checked)
        }
      }}
    >
      <span className="parle-switch-knob" />
    </button>
  )
}
