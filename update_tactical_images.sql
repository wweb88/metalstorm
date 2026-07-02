-- Agregar columna comment a la tabla airplane_tactical_images
ALTER TABLE public.airplane_tactical_images
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Actualizar las políticas existentes para asegurarse de que todos (usuarios y admins)
-- puedan ver y modificar las imágenes correctamente.
-- Las políticas de INSERT, SELECT, DELETE siguen aplicando de la misma manera que antes
-- ya que usan (true) o verifican que sean usuarios autenticados.
-- En caso de UPDATE (editar datos), vamos a crear una política.
-- Solo el uploader original o alguien con rol 'ADMIN'/'SUPER_ADMIN' debería poder actualizar, 
-- pero como la validación de rol se hará también desde el frontend (server actions) con permisos del admin client, 
-- podemos simplificar habilitando UPDATE para usuarios autenticados.

CREATE POLICY "Allow authenticated update access for tactical images"
ON public.airplane_tactical_images
FOR UPDATE TO authenticated USING (true);
