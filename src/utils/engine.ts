import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MOUSE,
  Mesh,
  Box3,
  Material,
  MeshPhongMaterial,
  WebGLRenderTarget,
  Vector2,
  Object3D,
  LinearFilter,
  RGBAFormat,
  ShaderMaterial,
  ReinhardToneMapping,
  PointLight,
  MeshStandardMaterial,
  TextureLoader,
  Texture,
  MirroredRepeatWrapping,
  SRGBColorSpace,
  PCFSoftShadowMap,
  AmbientLight
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadCharactor } from "./loaders/loadModel";
import { EventManager } from "./events/eventManager";
import { ModelAnimation } from "./animations/modelAnimation";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer, FXAAShader, OutlinePass, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from "three/examples/jsm/Addons.js";
import { vertexShader, fragmentShader } from "./shaders/bloomShader"

export class Engine extends Scene {
  private dom: HTMLElement;
  public camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private effectComposer!: EffectComposer;
  private glowComposer!: EffectComposer;
  private outlinePass!: OutlinePass;
  private unrealBloomPass!: UnrealBloomPass;
  private shaderPass!: ShaderPass;
  private controls: OrbitControls;
  private transformControls!: TransformControls
  private stats: Stats;
  private transformControlsTransing: boolean = false;

  constructor(dom: HTMLElement) {
    super();
    this.dom = dom;
    // 1.初始化渲染器
    this.renderer = new WebGLRenderer({
      // 抗锯齿
      antialias: true,
    });
    // 允许阴影
    this.renderer.shadowMap.enabled = true;

    // 2.設置场景
    this.background = new Color(0x333333);

    // 3.初始化相机，透视相机
    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // 设置相机位置
    this.camera.position.set(0, 2, 6);
    // 设置相机朝向
    this.camera.lookAt(new Vector3(0, 0, 0));
    // 设置相机朝上方向
    this.camera.up = new Vector3(0, 1, 0);

    // 添加聚光灯
    const ambientLight = new AmbientLight( 0xffffff);
    const pointLight = new PointLight( 0xffffff, 100 );
    pointLight.position.set(20, 20, 20)
    this.add( ambientLight );
    this.add( pointLight );

    // 控制器
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    // 由控件所使用的鼠标操作的引用。
    this.controls.mouseButtons = {
        LEFT: null,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
    }

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    // 加载模型
    loadCharactor(this)
    .then(gltf=>{
      console.log("Loaded Model: ", gltf, gltf.scene)
      // this.initAnimation(gltf)
      // 绑定事件
      this.initEvent()
      this.createEffectComposer()
    })
    
    // 性能监视器
    this.stats = new Stats();
    const statsDom = this.stats.dom;
    statsDom.style.position = 'fixed';
    statsDom.style.left = '5px'
    statsDom.style.top = '0'

    this.renderer.setPixelRatio( window.devicePixelRatio );
    //设置页面大小
    this.renderer.setSize(window.innerWidth, window.innerHeight, true);
    this.renderer.autoClear = true
		this.renderer.outputColorSpace = SRGBColorSpace
    // 色调映射
    this.renderer.toneMapping = ReinhardToneMapping
    this.renderer.toneMappingExposure = 2
    this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = PCFSoftShadowMap
    // 添加场景到页面上
    this.dom.appendChild(this.renderer.domElement);
    this.dom.appendChild(statsDom)

    // 渲染数据
    this.animate();
  }
  createEffectComposer(){
    const { clientWidth, clientHeight } = this.dom;
    // 创建合成器
    this.effectComposer = new EffectComposer(this.renderer)
    // 创建第一个渲染通道（无后期效果）
    let renderPass = new RenderPass(this, this.camera)

    // 增加外轮廓效果
    this.outlinePass = new OutlinePass(new Vector2(clientWidth, clientHeight), this, this.camera)
		this.outlinePass.visibleEdgeColor = new Color('#ffffff') // 可见边缘的颜色
		this.outlinePass.hiddenEdgeColor = new Color('#8a90f3') // 不可见边缘的颜色
		this.outlinePass.edgeGlow = 1 // 发光强度
		this.outlinePass.usePatternTexture = false // 是否使用纹理图案
		this.outlinePass.edgeThickness = 2 // 边缘浓度
		this.outlinePass.edgeStrength = 2 // 边缘的强度，值越高边框范围越大
		this.outlinePass.pulsePeriod = 2 // 闪烁频率，值越大频率越低
    // 添加抗锯齿效果
    let effectFXAA = new ShaderPass(FXAAShader)
    const pixelRatio = this.renderer.getPixelRatio()
		effectFXAA.uniforms.resolution.value.set(1 / (clientWidth * pixelRatio), 1 / (clientHeight * pixelRatio))
		effectFXAA.renderToScreen = true
		effectFXAA.needsSwap = true

    //创建辉光效果(UnrealBloomPass符合unreal引擎的辉光效果)
		this.unrealBloomPass = new UnrealBloomPass(new Vector2(clientWidth, clientHeight), 1.5, 0.4, 0.85)

    // 辉光合成器
		const renderTargetParameters = {
			minFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false,
		};

    // 辉光合成器
    this.glowComposer = new EffectComposer(this.renderer,  new WebGLRenderTarget(clientWidth, clientHeight, renderTargetParameters))
    this.glowComposer.renderToScreen = false
    let glowRenderPass = new RenderPass(this, this.camera)
    this.glowComposer.addPass(glowRenderPass)
		this.glowComposer.addPass(this.unrealBloomPass)
    
    // 着色器（合成两个合成器）
    this.shaderPass = new ShaderPass(new ShaderMaterial({
			uniforms: {
				baseTexture: { value: null },
				bloomTexture: { value: this.glowComposer.renderTarget2.texture },
				tDiffuse: { value: null },
				glowColor: { value: null }
			},
			vertexShader,
			fragmentShader,
			defines: {}
		}), 'baseTexture')

		this.shaderPass.material.uniforms.glowColor.value = new Color(0xffffff);
		this.shaderPass.renderToScreen = true;
		this.shaderPass.needsSwap = true;

    let outputPass = new OutputPass()

    this.effectComposer.addPass(renderPass)
    this.effectComposer.addPass(this.outlinePass)
    this.effectComposer.addPass(outputPass)
    this.effectComposer.addPass(effectFXAA)
    this.effectComposer.addPass(this.shaderPass)

    this.toggleBloom(false,null)
  }
  toggleBloom(isBloom: boolean, intersectObject: Object3D | null){
    // 设置辉光效果
		if (isBloom) {
      this.outlinePass.selectedObjects = [intersectObject as Object3D];
			this.unrealBloomPass.threshold = 0.4
			this.unrealBloomPass.strength = 1.5
			this.unrealBloomPass.radius = 0.5
			this.renderer.toneMappingExposure = 0.5
			this.shaderPass.material.uniforms.glowColor.value = new Color(0xffffff)

		} else {
      this.outlinePass.selectedObjects = [];
			this.unrealBloomPass.threshold = 0
			this.unrealBloomPass.strength = 0
			this.unrealBloomPass.radius = 0
			this.renderer.toneMappingExposure = 0.5
			this.shaderPass.material.uniforms.glowColor.value = new Color()
		}
  }
  transformControlsEvent(){
    // 设置与OrbitControls事件隔离
    this.transformControls.addEventListener( 'dragging-changed', ( event ) => {
      this.controls.enabled = !event.value;
    });
    // 设置点击事件隔离
    this.transformControls.addEventListener("mouseDown", ()=>{
      this.transformControlsTransing = true
    });

    document.addEventListener("keyup",(event)=>{
      if(event.key == "e"){
          this.transformControls.mode = "scale"
      }
      if(event.key == "r"){
          this.transformControls.mode = "rotate"
      }
      if(event.key == "t"){
          this.transformControls.mode = "translate"
      }
    })
  }
  setMaterialMap(intersectObject: Mesh){
    // 纹理贴图
    const texture: TextureLoader = new TextureLoader();
    const mapTexture: Texture = texture.load("/models/maps/20.jpg");
    let material = intersectObject.material as MeshStandardMaterial
    material.map = mapTexture;
    material.map.wrapS = MirroredRepeatWrapping;
    material.map.wrapT = MirroredRepeatWrapping;
    material.map.flipY = false
    material.map.colorSpace = SRGBColorSpace
    material.map.minFilter = LinearFilter;
    material.map.magFilter = LinearFilter;
  }
  modelEvent(){
    // 模型点击获取事件
    let eventManager = new EventManager(this.renderer.domElement, this.camera, this)
    eventManager.addEventListener("click", (event)=>{
      if(this.transformControlsTransing) {
        this.transformControlsTransing = false
        return;
      }
      let intersectObject = (event as any).intersectObject as (Mesh|null);
      console.log("Current Clicked Object: ", intersectObject)
      
      if(intersectObject){
        this.setMaterialMap(intersectObject)
        this.toggleBloom(true, intersectObject)
        // this.add(this.transformControls)
        this.transformControls.attach(intersectObject)
        
      }else{
        this.toggleBloom(false, null)
        this.transformControls.detach()
        this.remove(this.transformControls)
      }
    })
  }
  resize(){
    window.addEventListener("resize",()=>{
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight, true);
    })
  }
  initEvent(){
    this.resize()
    this.transformControlsEvent()
    this.modelEvent()
  }
  initAnimation(gltf: GLTF){
    let modelAnimation = new ModelAnimation(gltf, this);
    modelAnimation.start()
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.transformControls.updateMatrixWorld()
    this.controls.update();
    this.stats.update();
    // this.renderer.render(this, this.camera);
    if(this.glowComposer){
      this.glowComposer.render()
    }
    if(this.effectComposer){
      this.effectComposer.render()
    }
  }
}
