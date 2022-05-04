#version 300 es

precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragmentColor;

float get_spiral(vec3 camera, vec3 screen, vec3 point) {
    return length(cross(point - camera, screen)) / length(screen);
}

void main() {

    vec2 uv = (gl_FragCoord.xy * 2. - u_resolution.xy);
    uv = uv / min(u_resolution.x, u_resolution.y) * .5;

    float bubble_spiral_a = 1.0;
    float bubble_spiral_b = 1.0;

    for(float i=-8.; i<8.; i+=.2) {
        vec3 camera_a = vec3(0., i*.12, sin(u_time));
        vec3 screen_a = vec3(uv.x, uv.y, 0.) - camera_a;
        vec3 point_a = vec3(sin(u_time+i), 0., 2. + cos(u_time+i));
        float multi_bubble_spiral_a = get_spiral(camera_a, screen_a, point_a);
        multi_bubble_spiral_a = smoothstep(.1, .11, multi_bubble_spiral_a);
        bubble_spiral_a = bubble_spiral_a * multi_bubble_spiral_a;

        vec3 camera_b = vec3(0., i*.12, cos(u_time));
        vec3 screen_b = vec3(uv.x, uv.y, 0.) - camera_b;
        vec3 point_b = vec3(sin(u_time+i), 0., 2. + cos(u_time+i));
        float multi_bubble_spiral_b = get_spiral(camera_b, screen_b, point_b);
        multi_bubble_spiral_b = smoothstep(.1, .11, multi_bubble_spiral_b);
        bubble_spiral_b = bubble_spiral_b * multi_bubble_spiral_b;
    }

    fragmentColor = vec4( bubble_spiral_a ,bubble_spiral_b*0.5, 0.5, 1.0);
}
