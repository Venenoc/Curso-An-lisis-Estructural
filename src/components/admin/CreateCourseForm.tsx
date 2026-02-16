"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseSchema, type CourseInput } from "@/lib/schemas";
import { createCourse } from "@/app/actions/admin";

export default function CreateCourseForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
  });

  async function onSubmit(data: CourseInput) {
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("subscriptionOnly", (data.subscriptionOnly ?? false).toString());

    const result = await createCourse(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Crear Nuevo Curso</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>✓ Curso creado exitosamente</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso</Label>
            <Input
              id="title"
              placeholder="Análisis Estructural Avanzado"
              disabled={isSubmitting}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              placeholder="Descripción detallada del curso..."
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isSubmitting}
              rows={5}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input
                id="price"
                type="number"
                placeholder="29.99"
                step="0.01"
                min="0"
                disabled={isSubmitting}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionOnly">Tipo</Label>
              <select
                id="subscriptionOnly"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isSubmitting}
                {...register("subscriptionOnly", { setValueAs: (v: string) => v === "true" })}
              >
                <option value="false">Compra Única</option>
                <option value="true">Solo Suscripción</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Curso"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
