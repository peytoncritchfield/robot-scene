uniform float uTime;
uniform float uReactiveLength;
uniform float uLineLength;
uniform float uAdjustmentY;

varying vec4 vModelPosition;

void main() 
{
    float manipulation = (-vModelPosition.y - uLineLength + uAdjustmentY + uReactiveLength);

    vec3 colorStart = vec3(0.0, 0.0, 0.0);
    vec3 colorEnd = vec3(0.7, 0.0, 0.0);


    float r = clamp(manipulation, colorStart.r, colorEnd.r);
    float g = clamp(manipulation, colorStart.g, colorEnd.g);
    float b = clamp(manipulation, colorStart.b, colorEnd.b);

    gl_FragColor = vec4(r, g, b, 1.0);

}