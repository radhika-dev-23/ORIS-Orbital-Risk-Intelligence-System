# ─── ORIS Simulation Engine ───────────────────────────────────────────────────


import numpy as np
from dataclasses import dataclass, field
from typing import List, Literal

EARTH_RADIUS = 6371      
SIM_SCALE    = 120       

ObjectType = Literal['satellite', 'debris']

@dataclass
class OrbitalObject:
    id:          int
    type:        ObjectType
    r:           float          
    theta:       float          
    phi:         float          
    inclination: float          
    omega:       float          
    mass:        float          
    size:        float          
    x:           float = 0.0
    y:           float = 0.0
    z:           float = 0.0
    vx:          float = 0.0
    vy:          float = 0.0
    vz:          float = 0.0
    risk:        float = 0.0
    trail:       List  = field(default_factory=list)

    def to_dict(self):
        return {
            'id': self.id, 'type': self.type,
            'x': round(self.x, 2), 'y': round(self.y, 2), 'z': round(self.z, 2),
            'vx': round(self.vx, 3), 'vy': round(self.vy, 3),
            'risk': round(self.risk, 3), 'size': self.size, 'r': round(self.r, 1),
        }


class SimulationEngine:
    def __init__(self):
        self.objects:   List[OrbitalObject] = []
        self.frame:     int   = 0
        self.running:   bool  = True
        self.speed:     float = 1.0

    def _generate(self, obj_type: ObjectType, obj_id: int, r: float = None) -> OrbitalObject:
        rng = np.random
        r   = r or rng.uniform(SIM_SCALE + 30, SIM_SCALE + 220)
        sign = 1 if rng.random() > 0.5 else -1
        return OrbitalObject(
            id          = obj_id,
            type        = obj_type,
            r           = r,
            theta       = rng.uniform(0, 2 * np.pi),
            phi         = rng.uniform(-0.4, 0.4),
            inclination = rng.uniform(-0.6, 0.6),
            omega       = sign * rng.uniform(0.003, 0.012) * (180 / r),
            mass        = rng.uniform(500, 5000) if obj_type == 'satellite' else rng.uniform(0.1, 50),
            size        = rng.uniform(3, 6)      if obj_type == 'satellite' else rng.uniform(1, 3),
        )

    def _update_position(self, obj: OrbitalObject, dt: float = 1.0):
        obj.theta += obj.omega * dt
        cos_phi = np.cos(obj.phi)
        sin_i   = np.sin(obj.inclination)
        obj.x   = obj.r * np.cos(obj.theta) * cos_phi
        obj.y   = obj.r * np.sin(obj.theta) * cos_phi
        obj.z   = obj.r * np.sin(obj.phi) + obj.r * sin_i * np.sin(obj.theta) * 0.3
        obj.vx  = -obj.r * obj.omega * np.sin(obj.theta)
        obj.vy  =  obj.r * obj.omega * np.cos(obj.theta)

    def reset(self, scenario: str = 'normal'):
        from .collision import SCENARIO_CONFIGS
        cfg = SCENARIO_CONFIGS[scenario]
        self.objects = []
        obj_id = 0
        for _ in range(cfg['sat_count']):
            obj = self._generate('satellite', obj_id)
            self._update_position(obj, 0)
            self.objects.append(obj)
            obj_id += 1
        for _ in range(cfg['debris_count']):
            obj = self._generate('debris', obj_id)
            self._update_position(obj, 0)
            self.objects.append(obj)
            obj_id += 1
        self.frame = 0

    def step(self, dt: float = 1.0):
        if not self.running:
            return
        for obj in self.objects:
            self._update_position(obj, dt * self.speed)
        self.frame += 1

    def get_state(self) -> dict:
        return {
            'objects': [o.to_dict() for o in self.objects],
            'frame':   self.frame,
            'count':   len(self.objects),
            'satellites': sum(1 for o in self.objects if o.type == 'satellite'),
            'debris':     sum(1 for o in self.objects if o.type == 'debris'),
        }

    def apply_maneuver(self, strategy: str = 'altitude_raise'):
        adjusted = 0
        for obj in self.objects:
            if obj.risk > 0.3:
                obj.r     += np.random.uniform(8, 20)
                obj.omega *= np.random.uniform(0.85, 1.1)
                obj.risk   = 0.0
                obj.trail  = []
                adjusted  += 1
        return adjusted
