precision highp float;
    
#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

//
// Description : GLSL 2D simplex noise function
//      Author : Ian McEwan, Ashima Arts
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License :
//  Copyright (C) 2011 Ashima Arts. All rights reserved.
//  Distributed under the MIT License. See LICENSE file.
//  https://github.com/ashima/webgl-noise
//
float snoise(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

float nSsnoise(vec2 v){ //signed symplex noise
    return (snoise(v)+1.)*0.5;
}

float circleBlur1(in vec2 _st, in float _radius, in vec2 pos){
    vec2 dist = _st -pos;
    float rScale = 2.296;
    return 1.-smoothstep(_radius-(_radius*rScale),
                        _radius+(_radius*rScale),
                        dot(dist,dist)*4.0);
}

float circleBlur2(in vec2 _st, in float _radius, in vec2 pos){
    vec2 dist = _st -pos;
    float rScale = 10.632;
    return 1.-smoothstep(_radius-(_radius*rScale),
                        _radius+(_radius*rScale),
                        dot(dist,dist)*4.0);
}

float normalizedSin(in float x){
    return (sin(x)+1.)*0.5;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                        vec2(12.9898,78.233)))*
        43758.5453123);
}

float circle(in vec2 _st, in float _radius, in vec2 pos){
    float offSet;
    offSet = u_resolution.y / u_resolution.x;
    offSet = max(offSet, 1.);
    vec2 dist = _st -vec2(pos.x, offSet-pos.y);
    
    return 1.-smoothstep(_radius-(_radius*0.5),
                        _radius+(_radius*0.5),
                        dot(dist,dist)*4.0);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    
    vec2 st = gl_FragCoord.xy/min(u_resolution.x, u_resolution.y);
    vec2 mouse = u_mouse/min(u_resolution.x, u_resolution.y);

    float circlePct = circle(st, 0.5, mouse);
    
    float noiseScale = 0.25;
    st.x += nSsnoise(st*noiseScale + u_time*0.1 + 20.) * 0.07;
    st.y += nSsnoise(st*noiseScale + u_time*0.1 + 98.408) *0.07;
        
    st *= 5.;
    st.x += step(1., mod(st.y,2.0)) * 0.5;
    vec2 stf = fract(st); 
    
    vec3 cyanHsb = vec3(0.532,1.,1.);
    cyanHsb.x += (random(vec2(floor(st)*10.))-0.5) * 0.134;
    float cyanLight = circleBlur2(stf, 0.02, vec2(0.5)) * 1.5;
    vec3 cyan = hsv2rgb(cyanHsb) * cyanLight;
    float whiteLight = circleBlur1(stf, 0.010, vec2(0.5));
    vec3 white = vec3(0.960,0.940,0.947) * whiteLight * 1.5;
    
    vec3 color = vec3(0.);
    float luminance = normalizedSin(u_time * 0.916  +  random(vec2(floor(st)*60.))*PI*2. );
    color = vec3(cyan + white) * luminance;
    
    color = min(color, 1.);
    color *= random(vec2(floor(vec2(st.x,st.y))*50. + u_time*0.00001 + 100.)) ;
    //マウスで光らせる
    color += vec3(0.520,0.825,0.562) * cyanLight * circlePct;
    color += vec3(0.825,0.817,0.724) * whiteLight * circlePct;

    gl_FragColor = vec4(color,1.0);
}