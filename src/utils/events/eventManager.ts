import {
  Camera,
  EventDispatcher,
  Intersection,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
  BaseEvent
} from "three";

export interface EventDispatcherParameters {
    intersectObjects: Intersection<Object3D>[]
    type: string
}
export class EventManager extends EventDispatcher<EventDispatcherParameters> {
  dom: HTMLElement;
  camera: Camera;
  scene: Scene;
  pointer: Vector2 = new Vector2();
  constructor(dom: HTMLElement, camera: Camera, scene: Scene) {
    super();
    this.dom = dom;
    this.camera = camera;
    this.scene = scene;
  }
  init() {
    this.onClick();
  }
  onClick() {
    const raycaster = new Raycaster();
    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(this.pointer, this.camera);
    // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(this.scene.children);
    for (let i = 0; i < intersects.length; i++) {
      // intersects[ i ].object.material.color.set( 0xff0000 );
    }
    this.dom.addEventListener("click", () => {
      this.dispatchEvent<any>({
        type: "click",
        intersectObjects: intersects
      });
    });
  }
}
