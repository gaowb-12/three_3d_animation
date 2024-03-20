import {
  Camera,
  EventDispatcher,
  Intersection,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
  Mesh,
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
    this.init()
  }
  init() {
    this.onClick();
  }
  private onClick() {
    this.dom.addEventListener("click", (event: MouseEvent) => {
        const domX = event.offsetX
        const domY = event.offsetY
        const width = this.dom.offsetWidth
        const height = this.dom.offsetHeight
        // 坐标位置归一化，将屏幕canvas坐标系，转换为webgl归一化坐标
        this.pointer.x = domX * 2 / width - 1;
        this.pointer.y = -domY * 2 / height + 1;
        const raycaster = new Raycaster();
        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(this.pointer, this.camera);
        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects(this.scene.children, true) as Intersection<Mesh>[];
        // 过滤得到网格模型
        const intersectObjects = intersects.filter(item=>{
            let object = item.object
            return object.isMesh && object.material
        })
        let intersectObject: Mesh | null = null
        if(intersectObjects.length > 0 ){
            intersectObject = intersectObjects[0].object;
        }
        this.dispatchEvent<any>({
            type: "click",
            intersectObject
        });
    });
  }
}
