from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Tabla 1: Tipos de Aviones (Ej: Light Fighter, Attack)
class PlaneType(db.Model):
    __tablename__ = 'plane_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    image_url = db.Column(db.String(255))
    
    # Relación: Un Tipo tiene muchos Aviones
    planes = db.relationship('Plane', backref='plane_type', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image_url
        }

# Tabla 2: Los Aviones (Ej: F-16, A-10)
class Plane(db.Model):
    __tablename__ = 'planes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    sub_name = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    
    # Conectamos con el ID de la tabla de arriba
    plane_type_id = db.Column(db.Integer, db.ForeignKey('plane_types.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subName": self.sub_name,
            "type": self.plane_type.name, # Gracias a la relación, podemos sacar el nombre directo
            "image": self.image_url
        }