#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
 
 float size = 5.0;
 float prob = 0.99; 

 vec2 pos = floor(1.0 / size * gl_FragCoord.xy);

 float color = 0.0;
 float starValue = random1(pos, vec2(10.0, 10.0));

 if (starValue > prob) {
 	vec2  center = size * pos + vec2(size, size) * 0.1;
 	float t = 0.9 + 0.1 * sin(u_Time + (starValue - prob) / (1.0 - prob) * 45.0);
	
	color = 1.0 - distance(gl_FragCoord.xy, center) / (0.1 * size);		

 	color = color * t  / (abs(gl_FragCoord.y - center.y)) * t / (abs(gl_FragCoord.x - center.x));
 }

 out_Col = vec4(vec3(color), 1.0);
}
