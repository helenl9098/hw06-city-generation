#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec3 vs_Scale;
in vec4 vs_Rotate;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec3 fs_Offset;

// based from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToMatrix/
mat4 matrixFromAxisAngle() {
    vec3 axis = vec3(vs_Rotate);
    float angle = vs_Rotate.w;
    
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;

    axis = normalize(axis);

    float m00 = c + axis.x * axis.x * t;
    float m11 = c + axis.y * axis.y * t;
    float m22 = c + axis.z * axis.z * t;

    float tmp1 = axis.x * axis.y * t;
    float tmp2 = axis.z * s;
    float m10 = tmp1 + tmp2;
    float m01 = tmp1 - tmp2;
    tmp1 = axis.x*axis.z*t;
    tmp2 = axis.y*s;
    float m20 = tmp1 - tmp2;
    float m02 = tmp1 + tmp2;    
    tmp1 = axis.y*axis.z*t;
    tmp2 = axis.x*s;
    float m21 = tmp1 + tmp2;
    float m12 = tmp1 - tmp2;


    return mat4(vec4(m00, m10, m20, 0.0),
                vec4(m01, m11, m21, 0.0), 
                vec4(m02, m12, m22, 0.0), 
                vec4(0.0, 0.0, 0.0, 1.0));
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    vec3 offset = vs_Translate;

    if (fs_Pos.y != -0.5) {
        //if (vs_Scale.x != 1.0 && vs_Col.x < 1.0) {
        if (vs_Col.y < vs_Col.z) {
            if (vs_Scale.x != 1.0) {
            fs_Pos.y *= vs_Scale.y + sin((u_Time +  offset.x * 10.0 + offset.z * 10.0
                                        + vs_Pos.x * 8.0 + vs_Pos.z * 8.0)  * 0.05) * 0.5 + 5.0;
            }
            else {
               fs_Pos.y *= vs_Scale.y + sin((u_Time +  offset.x * 10.0 + offset.z * 10.0
                                        + vs_Pos.x * 8.0 + vs_Pos.z * 8.0)  * 0.05) * 0.5 + 0.0; 
            }
            if (fs_Pos.y < -0.5) {
                fs_Pos.y = -0.5;
            }
        }
        else {
    	   fs_Pos.y *= vs_Scale.y;
    	   fs_Pos.y += offset.y;
        }
    }
    if (vs_Scale.x != 0.0) {
    	fs_Pos.x *= vs_Scale.x;
    	fs_Pos.z *= vs_Scale.z;
	}

    if (vs_Rotate.y != 0.0 && vs_Rotate.a != 0.0) {
        mat4 matrix = matrixFromAxisAngle();
        fs_Pos = matrix * fs_Pos;
    }

    fs_Offset = offset;

    gl_Position = u_ViewProj * (fs_Pos + vec4(offset.x, 0.0, offset.z, 0.0)); 
}
