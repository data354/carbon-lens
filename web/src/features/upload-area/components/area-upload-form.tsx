"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  MIN_NAME_LENGTH,
  UploadGeoJsonSchema,
} from "../validations/upload";
import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { uploadGeoJson } from "../actions/upload-geojson";
import { AreaUploader } from "./area-uploader";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

interface AreaUploadFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  onValidStateChange?: (isValid: boolean) => void;
  onPendingChange?: (isPending: boolean) => void;
}

export function AreaUploadForm({
  className,
  onValidStateChange,
  onPendingChange,
  ...props
}: AreaUploadFormProps) {
  const { date } = useMapFilters();
  const { close: closeDialog } = useDashboardDialogs();
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof UploadGeoJsonSchema>>(
    {
      resolver: zodResolver(UploadGeoJsonSchema),
      defaultValues: {
        date: date,
        file: undefined,
        name: "",
      },
    },
  );

  const handleSubmit = (
    data: z.infer<typeof UploadGeoJsonSchema>,
  ) => {
    startTransition(async () => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("date", data.date);
      formData.append("file", data.file);

      const result = await uploadGeoJson(formData);

      if (!result.ok) {
        console.error(
          "Erreur lors de l'importation du fichier GeoJSON:",
          result.error,
        );

        toast.error(
          "Erreur lors de l'importation de votre fichier.",
        );

        return;
      }

      toast.success("Fichier importé avec succès.");

      form.reset();
      closeDialog();
    });
  };

  useEffect(() => {
    onValidStateChange?.(form.formState.isValid);
  }, [form.formState.isValid, onValidStateChange]);

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  return (
    <form
      {...props}
      className={className}
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Controller
          name="file"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <AreaUploader
                file={field.value}
                onFileChange={(file) => {
                  field.onChange(file);
                }}
                inputProps={{
                  name: field.name,
                  disabled: field.disabled,
                  onBlur: field.onBlur,
                }}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">
                Nom de la zone
              </FieldLabel>
              <Input
                aria-invalid={fieldState.invalid}
                placeholder={`Ex. : Terrain municipal, parcelle cadastrale, etc (${MIN_NAME_LENGTH} caractères minimum)`}
                className="h-11"
                autoComplete="off"
                autoFocus={false}
                {...field}
              />
              <FieldDescription>
                Ce nom apparaîtra dans le liste de vos zones
                personnalisées pour{" "}
                <span className="text-primary font-semibold">
                  {date}
                </span>
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
