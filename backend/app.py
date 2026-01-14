import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, PlaneType, Plane

app = Flask(__name__)
# CORS para todas las rutas
CORS(app)

# --- CONFIGURACIÓN ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/metalstorm_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- RUTAS ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend conectado a PostgreSQL 🚀"})

@app.route('/api/seed_data', methods=['POST'])
def seed_data():
    try:
        with open('seeds.json', 'r') as f:
            data = json.load(f)

        # Limpiar tablas para no duplicar
        Plane.query.delete()
        PlaneType.query.delete()
        
        type_map = {}
        for t in data['types']:
            new_type = PlaneType(name=t['name'], image_url=t['image'])
            db.session.add(new_type)
            type_map[t['name']] = new_type
        
        db.session.commit()

        count = 0
        for p in data['planes']:
            tipo_obj = PlaneType.query.filter_by(name=p['type']).first()
            if tipo_obj:
                new_plane = Plane(
                    name=p['name'],
                    sub_name=p['subName'],
                    image_url=p['image'],
                    plane_type_id=tipo_obj.id
                )
                db.session.add(new_plane)
                count += 1
        
        db.session.commit()
        return jsonify({"message": f"¡Éxito! Se cargaron {len(type_map)} tipos y {count} aviones."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ENDPOINT CON FILTROS ---
@app.route('/api/planes', methods=['GET'])
def get_planes():
    tipo_filtro = request.args.get('type')
    query = Plane.query
    
    if tipo_filtro:
        query = query.join(PlaneType).filter(PlaneType.name == tipo_filtro)
    
    planes = query.all()
    return jsonify([p.to_dict() for p in planes])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)