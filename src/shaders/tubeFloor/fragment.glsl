uniform float uTime;
uniform float uReactiveLength;
uniform float uLineLength;

varying vec4 vModelPosition;

void main() 
{
    float manipulation = (vModelPosition.z - uLineLength + uReactiveLength);

    vec3 colorStart = vec3(0.5, 0.2, 0.0);
    vec3 colorEnd = vec3(0.7, 0.8, 0.2);



    float r = clamp(manipulation, colorStart.r, colorEnd.r);
    float g = clamp(manipulation, colorStart.g, colorEnd.g);
    float b = clamp(manipulation, colorStart.b, colorEnd.b);

    // gl_FragColor = vec4(r, g, b, 1.0);

    gl_FragColor = vec4(0.7, 0.0, 0.0, manipulation);

}