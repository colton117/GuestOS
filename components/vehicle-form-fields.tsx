import { US_STATES, DEFAULT_VEHICLE_STATE } from "@/lib/us-states";

export function VehicleFormFields({
  defaultValues,
}: {
  defaultValues?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    plate?: string;
    state?: string;
    isDefault?: boolean;
  };
}) {
  return (
    <>
      <Field label="Make">
        <input
          name="make"
          defaultValue={defaultValues?.make ?? ""}
          autoComplete="off"
          className="gos-input"
        />
      </Field>
      <Field label="Model">
        <input
          name="model"
          defaultValue={defaultValues?.model ?? ""}
          autoComplete="off"
          className="gos-input"
        />
      </Field>
      <Field label="Year">
        <input
          name="year"
          type="number"
          defaultValue={defaultValues?.year ?? 2024}
          className="gos-input"
        />
      </Field>
      <Field label="Color">
        <input
          name="color"
          defaultValue={defaultValues?.color ?? ""}
          autoComplete="off"
          className="gos-input"
        />
      </Field>
      <Field label="Plate">
        <input
          name="plate"
          defaultValue={defaultValues?.plate ?? ""}
          autoComplete="off"
          className="gos-input"
        />
      </Field>
      <Field label="State">
        <input
          name="state"
          list="us-states"
          defaultValue={defaultValues?.state ?? DEFAULT_VEHICLE_STATE}
          autoComplete="off"
          maxLength={2}
          className="gos-input"
        />
        <datalist id="us-states">
          {US_STATES.map((state) => (
            <option key={state} value={state} />
          ))}
        </datalist>
      </Field>
      <label className="md:col-span-2 flex items-center gap-3 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-4">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={defaultValues?.isDefault ?? false}
          className="h-4 w-4 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
        />
        <span className="text-sm text-[color:var(--gos-text)]">Set as primary vehicle</span>
      </label>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[color:var(--gos-primary)]">{label}</span>
      {children}
    </label>
  );
}
