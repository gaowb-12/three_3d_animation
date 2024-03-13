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
  MeshPhongMaterial
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { loadCharactor } from "./loaders/loadModel";
import { EventManager } from "./events/eventManager";
import { ModelAnimation } from "./animations/modelAnimation";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Engine extends Scene {
  private dom: HTMLElement;
  public camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
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
      this.initAnimation(gltf)
      // 绑定事件
      this.initEvent()
    })
    
    // 性能监视器
    this.stats = new Stats();
    const statsDom = this.stats.dom;
    statsDom.style.position = 'fixed';
    statsDom.style.left = '5px'
    statsDom.style.top = '0'

    //设置页面大小
    this.renderer.setSize(window.innerWidth, window.innerHeight, true);
    // 添加场景到页面上
    this.dom.appendChild(this.renderer.domElement);
    this.dom.appendChild(statsDom)

    // 渲染数据
    this.animate();
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
        // const boundingBox = new Box3().setFromObject(intersectObject);
        // const center = boundingBox.getCenter(new Vector3());
        // intersectObject.userData.dragPosition = center
        // this.transformControls.position.copy(center);
        
        this.add(this.transformControls)
        this.transformControls.attach(intersectObject)
        
      }else{
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
    let modelAnimation = new ModelAnimation(gltf);
    modelAnimation.start()
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.transformControls.updateMatrixWorld()
    this.controls.update();
    this.stats.update();
    this.renderer.render(this, this.camera);
  }
}
