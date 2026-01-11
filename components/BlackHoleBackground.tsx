'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iColorOrange;
uniform vec3 iColorPurple;
uniform vec3 iColorBlue;
uniform vec3 iColorGreen;

// Extra white accent
uniform vec3 iColorWhite;
uniform float iIsLightMode; // 1.0 for light mode, 0.0 for dark mode

varying vec2 vUv;

#define PI 3.14159265359

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }



float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; 
  vec3 x3 = x0 - D.yyy;      
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float fbm(vec3 p) {
    float f = 0.0;
    float scale = 0.5;
    for (int i = 0; i < 3; i++) {
        f += snoise(p) * scale;
        p *= 2.0;
        scale *= 0.5;
    }
    return f;
}

vec3 getXosColor(float t) {
    vec3 col = vec3(0.0);
    col = mix(iColorPurple, iColorBlue, smoothstep(0.0, 0.4, t));
    col = mix(col, iColorGreen, smoothstep(0.4, 0.6, t));
    col = mix(col, iColorOrange, smoothstep(0.6, 1.0, t));
    // no white core
    return col;
}

void main() {
    vec2 uv = (vUv - 0.5) * 2.0;

    float aspect = iResolution.x / max(iResolution.y, 1.0);
    uv.x *= aspect;

    // Interstellar View: "Gargantua" style
    // Camera slightly above the equatorial plane (Y=1.0) and closer (Z=-8.0) to make it larger
    // Looking directly at the center (0,0,0)
    vec3 camPos = vec3(0.0, 1.0, -8.0);
    vec3 target = vec3(0.0, 0.0, 0.0);
    
    vec3 camDir = normalize(target - camPos);
    vec3 camRight = normalize(cross(camDir, vec3(0.0, 1.0, 0.0)));
    vec3 camUp = cross(camRight, camDir);
    
    // No artificial tilt/rotation to keep the sphere perfectly round
    vec3 rayDir = normalize(camDir + uv.x * camRight + uv.y * camUp);
    
    vec3 p = camPos;
    vec3 col = vec3(0.0);
    
    float maxDist = 20.0; 
    float curDist = 0.0;
    
    vec3 glow = vec3(0.0);
    float alpha = 0.0;
    
    for(int i = 0; i < 80; i++) {
        float r = length(p);
        
        float stepSize = max(0.05, r * 0.1); 
        if (r < 7.0) stepSize = 0.08; 
        if (r < 2.0) stepSize = 0.04;
        
        if(r < 1.0) {
            col = vec3(0.0);
            // In light mode, the hole should be white (inverted)
            if(iIsLightMode > 0.5) col = vec3(1.0);
            break;
        }

        // removed orange rim glow
        // float rim = exp(-pow((r - 1.08) / 0.08, 2.0));
        // glow += iColorOrange * (0.03 * rim) * (1.0 - alpha);

        // removed white ring glow
        // float whiteRim = exp(-pow((r - 1.12) / 0.04, 2.0));
        // glow += iColorWhite * (0.02 * whiteRim) * (1.0 - alpha);
        
        if(r < 8.0) {
            vec3 force = normalize(-p) * (1.5 / (r * r + 0.1));
            rayDir = normalize(rayDir + force * stepSize * 0.8);
        }
        
        float diskDist = abs(p.y);
        float diskRadius = length(p.xz);
        
        if(diskRadius > 1.5 && diskRadius < 7.0) {
            if(diskDist < 0.2) { 
                
                float angle = atan(p.z, p.x);
                float speed = 3.0 / sqrt(diskRadius);
                float rot = angle + iTime * speed;
                
                // Texture noise
                vec3 noisePos = vec3(diskRadius * 3.0, rot * 2.0, p.y * 5.0);
                float n = fbm(noisePos);
                
                float density = max(0.0, n);
                // Sharpen lines (contrast/shadows)
                density = pow(density, 1.5) * 1.5; 
                
                // Fade edges
                density *= smoothstep(1.5, 2.0, diskRadius) * smoothstep(7.0, 5.0, diskRadius);
                density *= smoothstep(0.2, 0.0, diskDist);
                
                if(density > 0.001) {
                    float temp = (7.0 - diskRadius) / (7.0 - 1.5);
                    temp += n * 0.3; 
                    temp = clamp(temp, 0.0, 1.0);
                    
                    vec3 emission = getXosColor(temp);
                    // Mix in extra orange only
                    emission = mix(emission, iColorOrange, 0.4); // More vibrant color
                    
                    float doppler = 1.0 - (p.x / diskRadius) * 0.6;
                    emission *= max(0.2, doppler);
                    
                    // Boost brightness significantly
                    float contribution = density * stepSize * 4.0; 
                    glow += emission * contribution * (1.0 - alpha);
                    alpha += contribution;
                }
            }
        }
        
        p += rayDir * stepSize;
        curDist += stepSize;
        
        if(curDist > maxDist || alpha > 0.98) break;
    }
    
    // Final color mixing
    col += glow;
    
    // Tone mapping
    col = col / (1.0 + col);
    col = pow(col, vec3(0.4545));

    // Force alpha to 1.0 inside the black hole (r < 1.0)
    // We can detect this if we didn't accumulate enough alpha from the disk
    // But we set col to vec3(0.0) and broke early when r < 1.0. 
    // Let's ensure alpha is solid for the black hole itself.
    // However, our alpha variable tracks opacity.
    
    gl_FragColor = vec4(col, alpha);
}
`;

function BlackHole() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  const colorOrange = new THREE.Color('#ffaa00');
  const colorPurple = new THREE.Color('#bc13fe');
  const colorBlue = new THREE.Color('#00aaff');
  const colorGreen = new THREE.Color('#00ff99');

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.iTime.value = state.clock.elapsedTime * 0.5;
      material.uniforms.iResolution.value.set(state.size.width, state.size.height);

      material.uniforms.iColorOrange.value.copy(colorOrange);
      material.uniforms.iColorPurple.value.copy(colorPurple);
      material.uniforms.iColorBlue.value.copy(colorBlue);
      material.uniforms.iColorGreen.value.copy(colorGreen);
      material.uniforms.iIsLightMode.value = theme === 'light' ? 1.0 : 0.0;
    }
  });

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iColorOrange: { value: new THREE.Color() },
      iColorPurple: { value: new THREE.Color() },
      iColorBlue: { value: new THREE.Color() },
      iColorGreen: { value: new THREE.Color() },
      iColorWhite: { value: new THREE.Color() },
      iIsLightMode: { value: 0.0 },
    }),
    []
  );

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function BlackHoleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 1] }}
        dpr={1}
        gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }}
      >
        <BlackHole />
      </Canvas>
    </div>
  );
}
