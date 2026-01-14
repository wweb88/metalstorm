# Usamos una imagen ligera de Python
FROM python:3.9-slim

# Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Instalamos herramientas necesarias para que PostgreSQL no falle
RUN apt-get update && apt-get install -y gcc libpq-dev

# Copiamos los requerimientos e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo tu código
COPY . .

# Abrimos el puerto 5000
EXPOSE 5000

# Comando para encender el servidor
CMD ["python", "app.py"]