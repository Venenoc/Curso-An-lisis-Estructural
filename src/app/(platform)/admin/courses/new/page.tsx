"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCourse } from "@/app/actions/courses";
import { courseSchema, type CourseInput } from "@/lib/schemas";

export default function CreateCoursePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
  });

  async function onSubmit(data: CourseInput) {
    setError(null);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("subscriptionOnly", String(data.subscriptionOnly));

    const result = await createCourse(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Crear Nuevo Curso</h1>
        <p className="text-muted-foreground">
          Completa los detalles básicos de tu curso
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Curso</CardTitle>
          <CardDescription>
            Estos datos pueden editarse más tarde
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curso</Label>
              <Input
                id="title"
                placeholder="ej: Análisis Estructural Avanzado"
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
                placeholder="Describe tu curso en detalle..."
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                rows={5}
                disabled={isSubmitting}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  disabled={isSubmitting}
                  {...register("price", {
                    valueAsNumber: true,
                  })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionOnly">Tipo</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="subscriptionOnly"
                    className="w-4 h-4"
                    disabled={isSubmitting}
                    {...register("subscriptionOnly")}
                  />
                  <label htmlFor="subscriptionOnly" className="text-sm">
                    Solo para suscriptores
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Creando..." : "Crear Curso"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
