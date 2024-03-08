import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MOUSE
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

export class Engine extends Scene {
  private dom: HTMLElement;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private stats: Stats;

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
    this.camera.position.set(240, 300, 300);
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

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.stats.update();
    this.renderer.render(this, this.camera);
  }
}
