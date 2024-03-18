// 顶点着色器
export const vertexShader = `
     varying vec2 vUv;
	 void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	 }
`
// 片元着色器
export const fragmentShader = `
		uniform sampler2D baseTexture;
		uniform sampler2D bloomTexture;
		uniform vec3 glowColor; 

		varying vec2 vUv;

		void main() {
			vec4 baseColor = texture2D(baseTexture, vUv);
			vec4 bloomColor = texture2D(bloomTexture, vUv);

			// 调整辉光颜色
			vec4 glow = vec4(glowColor, 1.0);

			gl_FragColor = baseColor + glow * bloomColor;
		}`