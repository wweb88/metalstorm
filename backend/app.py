import os
import json
from flask import Flask, jsonify
from models import db, PlaneType, Plane

app = Flask(__name__)

# 1. Configuración de la Base de Datos (Sacada de Docker)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/metalstorm_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos la DB con la app
db.init_app(app)

# Crear las tablas automáticamente al iniciar
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend conectado a PostgreSQL 🚀"})

# --- ZONA DE MAGIA: Cargar Datos del JSON ---
@app.route('/api/seed_data', methods=['POST'])
def seed_data():
    try:
        # 1. Leer el archivo JSON
        with open('seeds.json', 'r') as f:
            data = json.load(f)

        # 2. Limpiar tablas viejas (opcional, para no duplicar si le das 2 veces)
        Plane.query.delete()
        PlaneType.query.delete()
        
        # 3. Guardar los TIPOS primero
        type_map = {} # Diccionario para guardar referencias
        for t in data['types']:
            new_type = PlaneType(name=t['name'], image_url=t['image'])
            db.session.add(new_type)
            # Guardamos en memoria para usarlo luego
            type_map[t['name']] = new_type
        
        db.session.commit() # Confirmamos para generar los IDs

        # 4. Guardar los AVIONES vinculados a los Tipos
        count = 0
        for p in data['planes']:
            # Buscamos el objeto Tipo correspondiente
            tipo_obj = PlaneType.query.filter_by(name=p['type']).first()
            
            if tipo_obj:
                new_plane = Plane(
                    name=p['name'],
                    sub_name=p['subName'],
                    image_url=p['image'],
                    plane_type_id=tipo_obj.id # ¡Aquí hacemos el vínculo!
                )
                db.session.add(new_plane)
                count += 1
        
        db.session.commit()

        return jsonify({"message": f"¡Éxito! Se cargaron {len(type_map)} tipos y {count} aviones."}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Endpoint para probar que funciona: Listar Aviones ---
@app.route('/api/planes', methods=['GET'])
def get_planes():
    planes = Plane.query.all()
    return jsonify([p.to_dict() for p in planes])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)