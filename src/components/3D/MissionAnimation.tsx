import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Cartoon Person Component
function CartoonPerson({ position, color, lookAt, role }: { 
  position: [number, number, number], 
  color: string, 
  lookAt: [number, number, number],
  role: string
}) {
  const personRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (personRef.current) {
      personRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
      // Make person look towards the house
      personRef.current.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={personRef} position={position}>
        {/* Body */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.6]} />
          <meshLambertMaterial color={color} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.12]} />
          <meshLambertMaterial color="#FFDBAC" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.04, 0.82, 0.1]}>
          <sphereGeometry args={[0.015]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.04, 0.82, 0.1]}>
          <sphereGeometry args={[0.015]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        
        {/* Smile */}
        <mesh position={[0, 0.75, 0.11]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.03, 0.005, 8, 16, Math.PI]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.25, 0.4, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshLambertMaterial color="#FFDBAC" />
        </mesh>
        <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3]} />
          <meshLambertMaterial color="#FFDBAC" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.1, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4]} />
          <meshLambertMaterial color="#4169E1" />
        </mesh>
        <mesh position={[0.1, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4]} />
          <meshLambertMaterial color="#4169E1" />
        </mesh>
        
        {/* Role indicator floating above */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshLambertMaterial color={role === 'buyer' ? '#10B981' : '#F59E0B'} />
          </mesh>
        </Float>
      </group>
    </Float>
  );
}

// Enhanced Cartoon House Component
function CartoonHouse() {
  const houseRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (houseRef.current) {
      houseRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      houseRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={houseRef} position={[0, -0.5, 0]}>
        {/* House Base with gradient-inspired color */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1.5, 1.5]} />
          <meshLambertMaterial color="#E0E7FF" />
        </mesh>
        
        {/* Roof with gradient purple */}
        <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.6, 1, 4]} />
          <meshLambertMaterial color="#8B5CF6" />
        </mesh>
        
        {/* Door with blue gradient color */}
        <mesh position={[0, 0.1, 0.76]}>
          <boxGeometry args={[0.4, 0.8, 0.05]} />
          <meshLambertMaterial color="#3B82F6" />
        </mesh>
        
        {/* Door Handle */}
        <mesh position={[0.15, 0.1, 0.81]}>
          <sphereGeometry args={[0.03]} />
          <meshLambertMaterial color="#F59E0B" />
        </mesh>
        
        {/* Windows with light blue */}
        <mesh position={[-0.6, 0.3, 0.76]}>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshLambertMaterial color="#DBEAFE" />
        </mesh>
        <mesh position={[0.6, 0.3, 0.76]}>
          <boxGeometry args={[0.3, 0.3, 0.05]} />
          <meshLambertMaterial color="#DBEAFE" />
        </mesh>
        
        {/* Window Frames */}
        <mesh position={[-0.6, 0.3, 0.77]}>
          <boxGeometry args={[0.32, 0.32, 0.03]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.6, 0.3, 0.77]}>
          <boxGeometry args={[0.32, 0.32, 0.03]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        
        {/* For Sale Sign */}
        <group position={[1.5, 0, 1]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
            <meshLambertMaterial color="#8B5CF6" />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// Floating Keys with gradient colors
function FloatingKeys() {
  const keyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (keyRef.current) {
      keyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.3;
      keyRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={keyRef} position={[3, 1, 0]}>
        {/* Key Body with gold gradient */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.8]} />
          <meshLambertMaterial color="#F59E0B" />
        </mesh>
        {/* Key Head */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1]} />
          <meshLambertMaterial color="#F59E0B" />
        </mesh>
        {/* Key Teeth */}
        <mesh position={[0.1, -0.3, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.05]} />
          <meshLambertMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[0.1, -0.1, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          <meshLambertMaterial color="#F59E0B" />
        </mesh>
      </group>
    </Float>
  );
}

// Floating Hearts with pink gradient
function FloatingHearts() {
  const heartRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (heartRef.current) {
      heartRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      heartRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.3;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={heartRef} position={[-3, 1.5, 0]}>
        {/* Heart Shape with pink gradient */}
        <mesh>
          <sphereGeometry args={[0.15]} />
          <meshLambertMaterial color="#EC4899" />
        </mesh>
        <mesh position={[-0.1, 0.1, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshLambertMaterial color="#EC4899" />
        </mesh>
        <mesh position={[0.1, 0.1, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshLambertMaterial color="#EC4899" />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <coneGeometry args={[0.1, 0.2]} />
          <meshLambertMaterial color="#EC4899" />
        </mesh>
      </group>
    </Float>
  );
}

// Main Animation Component
const MissionAnimation: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 3, 10], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#EC4899" />
        
        {/* Main House */}
        <CartoonHouse />
        
        {/* Buyers - positioned to look at house from left */}
        <CartoonPerson 
          position={[-4, 0, 2]} 
          color="#3B82F6" 
          lookAt={[0, 0, 0]}
          role="buyer"
        />
        <CartoonPerson 
          position={[-3.5, 0, 1.5]} 
          color="#06B6D4" 
          lookAt={[0, 0, 0]}
          role="buyer"
        />
        
        {/* Sellers - positioned to look at house from right */}
        <CartoonPerson 
          position={[4, 0, 2]} 
          color="#8B5CF6" 
          lookAt={[0, 0, 0]}
          role="seller"
        />
        <CartoonPerson 
          position={[3.5, 0, 1.5]} 
          color="#A855F7" 
          lookAt={[0, 0, 0]}
          role="seller"
        />
        
        {/* Property Elements */}
        <FloatingKeys />
        <FloatingHearts />
        
        {/* Sparkles Effect with gradient colors */}
        <Sparkles 
          count={40} 
          scale={[8, 8, 8]} 
          size={2} 
          speed={0.4}
          color="#F59E0B"
        />
        
        {/* Additional sparkles with blue color */}
        <Sparkles 
          count={30} 
          scale={[6, 6, 6]} 
          size={1.5} 
          speed={0.6}
          color="#3B82F6"
          position={[2, 2, 0]}
        />
        
        {/* Ground Plane with gradient-inspired green */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshLambertMaterial color="#10B981" />
        </mesh>
        
        {/* Clouds with soft gradient appearance */}
        <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <group position={[-4, 4, -2]}>
            <mesh>
              <sphereGeometry args={[0.3]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.9} transparent />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
              <sphereGeometry args={[0.4]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.9} transparent />
            </mesh>
            <mesh position={[0.6, 0, 0]}>
              <sphereGeometry args={[0.3]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.9} transparent />
            </mesh>
          </group>
        </Float>
        
        <Float speed={0.3} rotationIntensity={0} floatIntensity={0.2}>
          <group position={[4, 4.5, -3]}>
            <mesh>
              <sphereGeometry args={[0.25]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.8} transparent />
            </mesh>
            <mesh position={[0.25, 0, 0]}>
              <sphereGeometry args={[0.35]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.8} transparent />
            </mesh>
            <mesh position={[0.5, 0, 0]}>
              <sphereGeometry args={[0.25]} />
              <meshLambertMaterial color="#F3F4F6" opacity={0.8} transparent />
            </mesh>
          </group>
        </Float>
        
        {/* Interactive Controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={isHovered} 
          enableRotate={isHovered}
          maxPolarAngle={Math.PI / 2}
          minDistance={8}
          maxDistance={15}
        />
      </Canvas>
      
      {/* Overlay Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs text-gray-600">
          {isHovered ? 'Drag to rotate • Scroll to zoom' : 'Hover to interact with the scene'}
        </p>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">Buyers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-700">Sellers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionAnimation;