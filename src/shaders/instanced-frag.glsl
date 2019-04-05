#version 300 es
precision highp float;

uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec3 fs_Offset;

out vec4 out_Col;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

//Based off of iq's described here: http://www.iquilezles.org/www/articles/voronoilin
float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 5.0;
    vec2 m = vec2(0.0);
    for (int i = -1;i<=1;i++) {
        for (int j = -1;j<=1;j++) {
            vec2 g = vec2(i, j);
            vec2 o = random2(n+g, vec2(100., 100.));
            o = 0.5+0.5*sin(float(u_Time) / 20.0 +5.038*o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d<md) {
              md = d;
              m = n+g+o;
            }
        }
    }
    return md;
}

float ov(vec2 p) {
    float v = 0.0;
    float a = 0.4;
    for (int i = 0;i<3;i++) {
        v+= voronoi(p)*a;
        p*=2.0;
        a*=0.5;
    }
    return v;
}

float noise(vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	vec2 seed = vec2(10, 20);

	float a = random1(i, seed);
	float b = random1(i + vec2(1.0, 0.0), seed);
	float c = random1(i + vec2(0.0, 1.0), seed);
	float d = random1(i + vec2(1.0, 1.0), seed);

	vec2 u = f * f * (3.0 - 2.0 * f);

	return mix(a, b, u.x)  +
            (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    p /= 28.0;
	// Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    
	// Loop of octaves
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.;
        amplitude *= .5;
    }

    return value;
}

vec4 water(vec2 pos2d) {
  vec4 a = vec4(174, 194, 211, 1.0) / 255.;
  vec4 b = vec4(158, 170, 193, 1.0) / 255.;
  vec4 mix1 = mix(a, b, smoothstep(0.0, 0.85, ov(pos2d / 1.7)));

  //vec4 e1 = vec4(201, 216, 214, 1.0) / 255.;
  vec4 e1 = vec4(54, 86, 114, 1.0) / 255.;
  vec4 f1 = vec4(95, 175, 229, 1.0) / 255.;
  vec4 mix2 = mix(e1, f1, smoothstep(0.0, 0.85, ov(pos2d / 1.5)));

  float fbmvalue = fbm(pos2d * 2.0);
  return vec4(mix(mix1, mix2, fbmvalue));
}

void main()
{


	vec4 color = fs_Col;
	if (color.z > color.y) {
		color = water(vec2(fs_Offset * 10.0));
	}

	// Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(vec4(0.0, 10.0, 0.0, 0.0)));
    float diffuseTerm2 = dot(normalize(fs_Nor), normalize(vec4(-10.0, 10.0, 10.0, 0.0)));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
    diffuseTerm2 = clamp(diffuseTerm2, 0.0, 1.0);

    float ambientTerm = 0.4;

    float lightIntensity = diffuseTerm + ambientTerm;  //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    float specularIntensity = max(pow(dot(normalize(vec4(3.0, 10.0, 5.0, 0.0)), normalize(fs_Nor)), 80.0), 0.0);
    vec3 diffuseColor = vec3(color) * lightIntensity;

  	// vec4 e1 = vec4(vec3(color), 0.5);
  	// vec4 f1 = vec4(255, 200, 200, 0.1) / 255.;
   //  vec3 diffuseColor = vec3(mix(e1, f1, diffuseTerm));
    diffuseColor = clamp(diffuseColor, 0.0, 1.0);

    if (fs_Col.z > fs_Col.y) {
		diffuseColor = vec3(color) * lightIntensity + specularIntensity;
	}
    out_Col = vec4(diffuseColor, fs_Col.a);
    // if (fs_Offset.x > 0.0) {
    // 	out_Col = vec4(vec3(1.0, 0.0, 0.0), fs_Col.a);
    // }
}
