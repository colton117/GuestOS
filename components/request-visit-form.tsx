"use client";

import { useState } from "react";
import Link from "next/link";
import { SmsConsentCheckbox } from "@/components/sms-consent-checkbox";

type VehicleOption = {
  id: string;
  isDefault: boolean;
  year: number;
  make: string;
  model: string;
  plate: string;
};

export function RequestVisitForm({
  action,
  vehicles,
  defaultVehicleId,
  defaultArrival,
}: {
  action: (formData: FormData) => void | Promise<void>;
  vehicles: VehicleOption[];
  defaultVehicleId: string;
  defaultArrival: string;
}) {
  const [parkingRequired, setParkingRequired] = useState(true);
  const [vehicleId, setVehicleId] = useState(defaultVehicleId);

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <Field label="Arrival Date & Time">
        <input
          name="arrivalDateTime"
          type="datetime-local"
          defaultValue={defaultArrival}
          className="gos-input"
        />
      </Field>
      <Field label="Departure Date & Time">
        <input name="departureDateTime" type="datetime-local" className="gos-input" />
      </Field>

      <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-4 transition-transform duration-[180ms] hover:-translate-y-0.5">
          <input
            type="checkbox"
            name="parkingRequired"
            checked={parkingRequired}
            onChange={(event) => {
              const checked = event.target.checked;
              setParkingRequired(checked);
              if (!checked) setVehicleId("");
            }}
            className="h-4 w-4 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
          />
          <span className="text-sm text-[color:var(--gos-text)]">Parking Required</span>
        </label>
        <ToggleCard name="buildingAccessRequired" label="Building Access Required" />
        <ToggleCard name="apartmentAccessRequired" label="Apartment Access Required" />
      </div>

      {parkingRequired ? (
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[color:var(--gos-primary)]">Vehicle</span>
          <select
            name="vehicleId"
            value={vehicleId}
            onChange={(event) => {
              const next = event.target.value;
              setVehicleId(next);
              if (!next) setParkingRequired(false);
            }}
            className="gos-input"
          >
            <option value="">No vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.isDefault ? "Primary - " : ""}
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.plate}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="vehicleId" value="" />
      )}

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-[color:var(--gos-primary)]">
          Request Notes
        </span>
        <textarea name="requestNotes" rows={5} className="gos-input" />
      </label>

      <div className="md:col-span-2">
        <SmsConsentCheckbox />
      </div>

      <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href="/vehicles" className="gos-button-secondary">
          Manage Vehicles
        </Link>
        <button className="gos-button-primary">Submit Request</button>
      </div>
    </form>
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

function ToggleCard({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-4 transition-transform duration-[180ms] hover:-translate-y-0.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked
        className="h-4 w-4 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
      />
      <span className="text-sm text-[color:var(--gos-text)]">{label}</span>
    </label>
  );
}
