import {
  AnimationClip,
  AnimationMixer,
  AnimationAction,
  LoopRepeat,
  Clock,
  AnimationActionLoopStyles,
  Object3D,
  Quaternion,
  Vector3,
  CatmullRomCurve3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Scene,
} from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface AnimationConfig {
  animationName: string;
  timeScale: number;
  weight: number;
  loop: AnimationActionLoopStyles;
  repetitions: number;
}
let defaultConfig = {
  animationName: "Default",
  timeScale: 1,
  weight: 1,
  loop: LoopRepeat,
  repetitions: Infinity,
};

export class ModelAnimation {
  private scene: Scene;
  private model: Object3D;
  private animations: AnimationClip[];
  private animationMixer: AnimationMixer;
  private animationAction!: AnimationAction;
  private animationFrameId!: number;
  private animationColock: Clock;
  private during: number = 5000;

  constructor(gltf: GLTF, scene: Scene) {
    this.scene = scene;
    this.animationColock = new Clock();
    // 获取模型中的关键帧轨道集（动画集合）
    this.animations = gltf.animations;
    this.model = gltf.scene;
    // 初始化动画混合器
    this.animationMixer = new AnimationMixer(gltf.scene);
  }

  private setModelAnimation(animationConfig: AnimationConfig) {
    const { animationName, timeScale, weight, loop, repetitions } =
      animationConfig;
    // 获取当前模型的动画剪辑
    const clip = AnimationClip.findByName(this.animations, animationName);
    this.animationAction = this.animationMixer.clipAction(clip);
    this.animationAction
      .setEffectiveTimeScale(timeScale)
      .setEffectiveWeight(weight)
      .setLoop(loop, repetitions)
      .play();
  }

  // 动画帧
  private animationFrame() {
    this.animationFrameId = requestAnimationFrame(() => this.animationFrame());
    if (this.animationMixer) {
      this.animationMixer.update(this.animationColock.getDelta());
    }
    this.setRotationAroundAxis();
    // this.setCurve3Animation(this.animationColock.elapsedTime * 1000)
  }

  // 设置绕轴动画
  private setRotationAroundAxis() {
    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(new Vector3(0, 1, 0), 0.05);

    this.model.applyQuaternion(quaternion);
  }

  private makePathCurve() {
    //Create a closed wavey loop
    const curve = new CatmullRomCurve3([
      new Vector3(-5, 0, 5),
      new Vector3(-2, 5, 5),
      new Vector3(0, 0, 0),
      new Vector3(5, 0, 5),
    ]);
    curve.closed = true;
    curve.tension = 1;

    // record location points array by coveraging 50 fragment
    const points = curve.getPoints(50);
    // create BufferGeometry
    const geometry = new BufferGeometry().setFromPoints(points);
    // create LineBasicMetarial
    const material = new LineBasicMaterial({ color: 0xff0000 });

    // create Line
    const curveObject = new Line(geometry, material);
    this.scene.add(curveObject);
    return curve
  }
  getProgress(time: number): number{
    return time / this.during % 1;
  }
  // set path animation of current model
  private setCurve3Animation(time: number) {
    const curve = this.makePathCurve();
    // get location point by progress
    const progress = this.getProgress(time);
    const point = curve.getPointAt(progress);
    this.model.position.set(point.x, point.y, point.z);
  }

  //   开始执行动画
  start(animationConfig: AnimationConfig = defaultConfig) {
    this.setModelAnimation(animationConfig);
    this.animationFrame();
  }
  //   结束动画
  end() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationMixer.stopAllAction();
    this.animationMixer.update(0);
  }
}
