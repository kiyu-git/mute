precision highp float;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_scrollY;

//https://thebookofshaders.com/10/?lan=jp
float random (vec2 _st) {
    return fract(sin(dot(_st.xy,
                        vec2(12.9898,78.233)))*
        43758.5453123);
}

float nSin( float _x ) { //normalized sin
    return (sin(_x) + 1.) * 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec2 mouse = u_mouse/u_resolution;
    mouse.x *= u_resolution.x/u_resolution.y;
    float scrollY = u_scrollY/u_resolution.y;
    scrollY = min(1., scrollY);
    scrollY = 1. - scrollY;

    vec2 rectSt = st;

    vec2 sta = st;
    sta.x += sin( st.y * PI *2. + 2.916) * -0.090 * scrollY;
    sta.x *= 345.000;
    sta.y *= PI * 2.;
    float pct = nSin(sta.x) * nSin(sta.y + PI*1.5) * scrollY;

    vec3 color = vec3(1.);
    float randNoise = random(st * 1.4 + vec2(0.,u_mouse.x*0.1));

    color -= randNoise * pct;

    gl_FragColor = vec4(1.-color,1.0);
}
